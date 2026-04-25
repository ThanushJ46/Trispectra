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
    import time
    start_time = time.time()
    print("[VISION] request received")

    try:
        print("[VISION] image decode and running YOLO inference...")
        result = await analyze_waste_image(
            image_base64=payload.image_base64,
            uid=payload.uid,
        )
        duration = time.time() - start_time
        print(f"[VISION] inference finished in {duration:.2f} seconds")
    except Exception as exc:
        print(f"[VISION] ERROR: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"YOLO Vision error: {exc}",
        ) from exc

    # Award 10 points per item detected, save analysis (Wrap in try/except to prevent blocking on Firebase issues)
    try:
        points = len(result.items) * 10
        _add_points(payload.uid, points, "waste_scan")
        
        # Save to Firestore
        analysis_dict = result.model_dump()
        save_analysis(payload.uid, analysis_dict)
    except Exception as e:
        print(f"[VISION] Firebase operations failed (points/save): {e}")

    print("[VISION] response sent")
    return result

@router.get("/status")
def get_vision_status():
    import os
    from services.yolo_service import _DEFAULT_MODEL_PATHS, _MODEL_DEFAULT_CONFIDENCE_THRESHOLDS
    
    models_info = []
    for model_path in _DEFAULT_MODEL_PATHS:
        exists = model_path.exists()
        size = model_path.stat().st_size if exists else 0
        models_info.append({
            "name": model_path.name,
            "path": str(model_path),
            "exists": exists,
            "size": size,
            "loaded": True if exists and size > 0 else False # Simplified for status
        })
        
    return {
        "models": models_info,
        "thresholds": {
            "laptop": float(os.getenv("YOLO_LAPTOP_CONFIDENCE_THRESHOLD", _MODEL_DEFAULT_CONFIDENCE_THRESHOLDS.get("laptop_best.pt", 0.30))),
            "organic": float(os.getenv("YOLO_ORGANIC_CONFIDENCE_THRESHOLD", _MODEL_DEFAULT_CONFIDENCE_THRESHOLDS.get("organic_best.pt", 0.90))),
            "waste": float(os.getenv("YOLO_WASTE_CONFIDENCE_THRESHOLD", _MODEL_DEFAULT_CONFIDENCE_THRESHOLDS.get("waste_best.pt", 0.25)))
        }
    }

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
