"""Router exposing the /analyze endpoint for waste image classification."""

from fastapi import APIRouter, HTTPException, status

from models.waste_schema import WasteAnalysisResponse, WasteImageRequest
from services.gemini_service import analyze_waste_image

router = APIRouter(prefix="/api/vision", tags=["Vision"])


@router.post(
    "/analyze",
    response_model=WasteAnalysisResponse,
    summary="Analyze a waste image",
    description=(
        "Accepts a base64-encoded image, sends it to Gemini 1.5 Pro Vision, "
        "and returns structured JSON identifying each waste item with its "
        "category, confidence score, and disposal tip."
    ),
)
async def analyze(payload: WasteImageRequest) -> WasteAnalysisResponse:
    """Classify waste items in the provided image."""

    try:
        result = await analyze_waste_image(
            image_base64=payload.image_base64,
            mime_type=payload.mime_type,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini Vision API error: {exc}",
        ) from exc

    return result
