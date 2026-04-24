"""Pydantic v2 models for the WasteWise vision analysis pipeline."""

from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class WasteCategory(str, Enum):
    """Classifies waste into one of the seven recognized categories."""

    wet_organic = "wet_organic"
    dry_recyclable = "dry_recyclable"
    e_waste = "e_waste"
    hazardous = "hazardous"
    medical = "medical"
    construction = "construction"
    sanitary = "sanitary"


class DisposalPath(str, Enum):
    """Recommended disposal route for a waste item."""

    compost = "compost"
    sell = "sell"
    donate = "donate"
    collection_point = "collection_point"
    special_facility = "special_facility"


class ConfidenceLevel(str, Enum):
    """Model confidence in the classification."""

    high = "high"
    medium = "medium"
    low = "low"


# ---------------------------------------------------------------------------
# Core response models
# ---------------------------------------------------------------------------


class WasteItem(BaseModel):
    """A single waste item identified by Gemini Vision."""

    model_config = {"str_strip_whitespace": True}

    item_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Short descriptive name of the waste item.",
    )
    waste_category: WasteCategory = Field(
        ...,
        description="Category the waste item belongs to.",
    )
    confidence: ConfidenceLevel = Field(
        ...,
        description="Model confidence in this classification.",
    )
    disposal_path: DisposalPath = Field(
        ...,
        description="Recommended disposal route.",
    )
    reason: str = Field(
        ...,
        max_length=150,
        description="One-line explanation (max 20 words).",
    )
    is_hazardous: bool = Field(
        ...,
        description="Whether this item poses a health or environmental hazard.",
    )

    @field_validator("reason")
    @classmethod
    def reason_max_twenty_words(cls, value: str) -> str:
        words = value.split()
        if len(words) > 20:
            raise ValueError(
                f"reason must be 20 words or fewer, got {len(words)} words"
            )
        return value


class AnalysisResult(BaseModel):
    """Aggregated result returned after analysing a waste image."""

    model_config = {"str_strip_whitespace": True}

    items: list[WasteItem] = Field(
        default_factory=list,
        description="List of waste items detected in the image.",
    )
    total_items_detected: int = Field(
        ...,
        ge=0,
        description="Total count of items detected.",
    )
    has_organic: bool = Field(
        ...,
        description="True if any item is categorised as wet_organic.",
    )
    has_ewaste: bool = Field(
        ...,
        description="True if any item is categorised as e_waste.",
    )
    has_hazardous: bool = Field(
        ...,
        description="True if any item is categorised as hazardous.",
    )
    analysis_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="Unique identifier for this analysis run.",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp when the analysis was performed.",
    )

    @field_validator("total_items_detected")
    @classmethod
    def count_matches_items(cls, value: int, info) -> int:
        items = info.data.get("items")
        if items is not None and len(items) != value:
            raise ValueError(
                f"total_items_detected ({value}) does not match "
                f"the number of items ({len(items)})"
            )
        return value


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    """Incoming request to analyse a waste image."""

    model_config = {"str_strip_whitespace": True}

    image_base64: str = Field(
        ...,
        min_length=1,
        description="Base64-encoded string of the waste image (JPEG/PNG).",
    )
    uid: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Firebase user ID of the requester.",
    )
    filename: str | None = Field(
        default=None,
        description="Original filename of the uploaded image, if available.",
    )

    @field_validator("image_base64")
    @classmethod
    def strip_data_uri_prefix(cls, value: str) -> str:
        if value.startswith("data:"):
            parts = value.split(",", 1)
            if len(parts) == 2:
                return parts[1]
        return value


class FeedbackRequest(BaseModel):
    """User feedback on a previously returned classification."""

    model_config = {"str_strip_whitespace": True}

    analysis_id: str = Field(
        ...,
        min_length=1,
        description="The analysis_id from the original AnalysisResult.",
    )
    uid: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Firebase user ID submitting the feedback.",
    )
    item_name: str = Field(
        ...,
        min_length=1,
        description="Name of the item the feedback is about.",
    )
    was_correct: bool = Field(
        ...,
        description="Whether the original classification was correct.",
    )
    correct_category: WasteCategory | None = Field(
        default=None,
        description="If was_correct is False, the correct category.",
    )

    @field_validator("correct_category")
    @classmethod
    def require_category_when_incorrect(
        cls, value: WasteCategory | None, info
    ) -> WasteCategory | None:
        was_correct = info.data.get("was_correct")
        if was_correct is False and value is None:
            raise ValueError(
                "correct_category is required when was_correct is False"
            )
        return value
