from __future__ import annotations

import base64
import binascii
from datetime import datetime, timezone
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

__all__ = [
    "WasteCategory",
    "DisposalPath",
    "ConfidenceLevel",
    "WasteItem",
    "AnalysisResult",
    "AnalyzeRequest",
    "FeedbackRequest",
]

_MODEL_CONFIG = ConfigDict(extra="forbid", str_strip_whitespace=True)


def _validate_single_line(value: str, field_name: str) -> str:
    if "\n" in value or "\r" in value:
        raise ValueError(f"{field_name} must be a single line")
    return value


def _validate_uuid4(value: str, field_name: str) -> str:
    try:
        parsed = UUID(value)
    except ValueError as exc:
        raise ValueError(f"{field_name} must be a valid UUID4 string") from exc

    if parsed.version != 4:
        raise ValueError(f"{field_name} must be a valid UUID4 string")

    return str(parsed)


class WasteCategory(str, Enum):
    wet_organic = "wet_organic"
    dry_recyclable = "dry_recyclable"
    e_waste = "e_waste"
    hazardous = "hazardous"
    medical = "medical"
    construction = "construction"
    sanitary = "sanitary"


class DisposalPath(str, Enum):
    compost = "compost"
    sell = "sell"
    donate = "donate"
    collection_point = "collection_point"
    special_facility = "special_facility"


class ConfidenceLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class WasteItem(BaseModel):
    model_config = _MODEL_CONFIG

    item_name: str = Field(..., min_length=1)
    waste_category: WasteCategory
    confidence: ConfidenceLevel
    disposal_path: DisposalPath
    reason: str = Field(..., min_length=1)
    is_hazardous: bool

    @field_validator("item_name")
    @classmethod
    def validate_item_name(cls, value: str) -> str:
        return _validate_single_line(value, "item_name")

    @field_validator("reason")
    @classmethod
    def validate_reason(cls, value: str) -> str:
        value = _validate_single_line(value, "reason")
        if len(value.split()) > 20:
            raise ValueError("reason must be 20 words or fewer")
        return value

    @model_validator(mode="after")
    def validate_hazard_flag(self) -> WasteItem:
        if self.waste_category == WasteCategory.hazardous and not self.is_hazardous:
            raise ValueError(
                "is_hazardous must be True when waste_category is hazardous"
            )
        return self


class AnalysisResult(BaseModel):
    model_config = _MODEL_CONFIG

    items: list[WasteItem]
    total_items_detected: int = Field(..., ge=0)
    has_organic: bool
    has_ewaste: bool
    has_hazardous: bool
    analysis_id: str = Field(default_factory=lambda: str(uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("analysis_id")
    @classmethod
    def validate_analysis_id(cls, value: str) -> str:
        return _validate_uuid4(value, "analysis_id")

    @field_validator("timestamp")
    @classmethod
    def validate_timestamp(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must be timezone-aware")
        return value.astimezone(timezone.utc)

    @model_validator(mode="after")
    def validate_summary_fields(self) -> AnalysisResult:
        expected_total = len(self.items)
        if self.total_items_detected != expected_total:
            raise ValueError(
                "total_items_detected must match the number of items"
            )

        expected_has_organic = any(
            item.waste_category == WasteCategory.wet_organic for item in self.items
        )
        if self.has_organic != expected_has_organic:
            raise ValueError("has_organic must match the detected items")

        expected_has_ewaste = any(
            item.waste_category == WasteCategory.e_waste for item in self.items
        )
        if self.has_ewaste != expected_has_ewaste:
            raise ValueError("has_ewaste must match the detected items")

        expected_has_hazardous = any(
            item.waste_category == WasteCategory.hazardous for item in self.items
        )
        if self.has_hazardous != expected_has_hazardous:
            raise ValueError("has_hazardous must match the detected items")

        return self


class AnalyzeRequest(BaseModel):
    model_config = _MODEL_CONFIG

    image_base64: str = Field(..., min_length=1)
    uid: str = Field(..., min_length=1, max_length=128)
    filename: str | None = None

    @field_validator("image_base64", mode="before")
    @classmethod
    def normalize_image_base64(cls, value: str) -> str:
        if not isinstance(value, str):
            return value

        normalized = value.strip()
        if normalized.startswith("data:") and "," in normalized:
            normalized = normalized.split(",", 1)[1]

        normalized = "".join(normalized.split())
        if not normalized:
            raise ValueError("image_base64 cannot be empty")

        padded = normalized + ("=" * (-len(normalized) % 4))
        try:
            base64.b64decode(padded, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("image_base64 must be valid base64 data") from exc

        return normalized

    @field_validator("uid")
    @classmethod
    def validate_uid(cls, value: str) -> str:
        return _validate_single_line(value, "uid")

    @field_validator("filename", mode="before")
    @classmethod
    def normalize_filename(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _validate_single_line(value, "filename")


class FeedbackRequest(BaseModel):
    model_config = _MODEL_CONFIG

    analysis_id: str = Field(..., min_length=1)
    uid: str = Field(..., min_length=1, max_length=128)
    item_name: str = Field(..., min_length=1)
    was_correct: bool
    correct_category: WasteCategory | None = None

    @field_validator("analysis_id")
    @classmethod
    def validate_analysis_id(cls, value: str) -> str:
        return _validate_uuid4(value, "analysis_id")

    @field_validator("uid")
    @classmethod
    def validate_uid(cls, value: str) -> str:
        return _validate_single_line(value, "uid")

    @field_validator("item_name")
    @classmethod
    def validate_item_name(cls, value: str) -> str:
        return _validate_single_line(value, "item_name")

    @model_validator(mode="after")
    def validate_feedback(self) -> FeedbackRequest:
        if not self.was_correct and self.correct_category is None:
            raise ValueError(
                "correct_category is required when was_correct is False"
            )
        if self.was_correct and self.correct_category is not None:
            raise ValueError(
                "correct_category must be omitted when was_correct is True"
            )
        return self
