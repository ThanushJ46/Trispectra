"""Router exposing the /analyze endpoint for waste image classification."""

from fastapi import APIRouter, HTTPException, status

from pydantic import BaseModel
from typing import Optional
from models.waste_schema import AnalysisResult, AnalyzeRequest
from services.yolo_service import analyze_waste_image
from services.firestore_service import save_analysis, _add_points

router = APIRouter(prefix="/api/vision", tags=["Vision"])


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="Analyze a waste image",
    description=(
        "Accepts a base64-encoded image with a Firebase UID, runs local "
        "YOLOv11 waste detection, and returns structured JSON identifying "
        "each waste item with its category, confidence, disposal path, and "
        "hazard flag."
    ),
)
async def analyze(payload: AnalyzeRequest) -> AnalysisResult:
    """Classify waste items in the provided image."""

    try:
        result = await analyze_waste_image(
            image_base64=payload.image_base64,
            uid=payload.uid,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"YOLO Vision error: {exc}",
        ) from exc

    # Award 10 points per item detected, save analysis
    points = len(result.items) * 10
    _add_points(payload.uid, points, "waste_scan")
    
    # Save to Firestore
    analysis_dict = result.model_dump()
    save_analysis(payload.uid, analysis_dict)

    return result


class FeedbackPayload(BaseModel):
    uid: str
    analysis_id: str
    correct: bool
    user_correction: Optional[str] = None


@router.post("/feedback")
async def submit_feedback(payload: FeedbackPayload):
    from services.firestore_service import save_feedback
    save_feedback(
        uid=payload.uid,
        analysis_id=payload.analysis_id,
        correct=payload.correct,
        correction=payload.user_correction
    )
    return {"success": True, "message": "Feedback saved. Thank you!"}
