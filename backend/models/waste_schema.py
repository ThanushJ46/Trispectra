"""Pydantic v2 models for waste classification requests and responses."""

from pydantic import BaseModel, Field


class WasteImageRequest(BaseModel):
    """Incoming request containing a base64-encoded image."""

    image_base64: str = Field(
        ...,
        description="Base64-encoded string of the waste image (JPEG/PNG).",
    )
    mime_type: str = Field(
        default="image/jpeg",
        description="MIME type of the encoded image.",
    )


class WasteItem(BaseModel):
    """A single identified waste item returned by the vision model."""

    name: str = Field(..., description="Name of the waste item.")
    category: str = Field(
        ...,
        description="Waste category (e.g. recyclable, compostable, hazardous, landfill).",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence score between 0 and 1.",
    )
    disposal_tip: str = Field(
        ...,
        description="Short tip on how to properly dispose of this item.",
    )


class WasteAnalysisResponse(BaseModel):
    """Top-level response wrapping the list of identified waste items."""

    items: list[WasteItem] = Field(
        default_factory=list,
        description="List of waste items detected in the image.",
    )
    summary: str = Field(
        ...,
        description="Human-readable summary of the analysis.",
    )
    item_count: int = Field(
        ...,
        ge=0,
        description="Total number of waste items detected.",
    )
