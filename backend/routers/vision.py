"""Router exposing the /analyze endpoint for waste image classification."""

from fastapi import APIRouter, HTTPException, status

from models.waste_schema import AnalysisResult, AnalyzeRequest
from services.yolo_service import analyze_waste_image

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

    return result
