from __future__ import annotations

import asyncio
import base64
import binascii
import io
import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError

from models.waste_schema import (
    AnalysisResult,
    ConfidenceLevel,
    DisposalPath,
    WasteCategory,
    WasteItem,
)

load_dotenv()

__all__ = ["YoloService", "analyze_waste_image"]

_DEFAULT_MODEL_PATH = Path("backend/models/yolo/best.pt")
_DEFAULT_RULES_PATH = Path("backend/config/waste_rules.json")
_DEFAULT_CONFIDENCE_THRESHOLD = 0.25
_FALLBACK_REASON = "Detected item needs manual disposal verification"
_MODEL_NOT_FOUND_MESSAGE = (
    "YOLO model file not found. Set YOLO_MODEL_PATH or place best.pt in "
    "backend/models/yolo/best.pt"
)
_RULE_REQUIRED_FIELDS = {
    "item_name",
    "waste_category",
    "disposal_path",
    "reason",
    "is_hazardous",
}


class YoloService:
    _instance: YoloService | None = None
    _instance_lock = threading.Lock()

    def __new__(cls) -> YoloService:
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return

        self._project_root = Path(__file__).resolve().parents[2]
        self.model_path = self._resolve_model_path()
        self.rules_path = self._resolve_rules_path()
        self.confidence_threshold = self._resolve_confidence_threshold()
        self.rules = self._load_rules()
        self._model: Any | None = None
        self._model_lock = threading.Lock()
        self._initialized = True

    def _resolve_model_path(self) -> Path:
        raw_path = os.getenv("YOLO_MODEL_PATH", str(_DEFAULT_MODEL_PATH)).strip()
        path = Path(raw_path).expanduser()
        if not path.is_absolute():
            path = (self._project_root / path).resolve()
        return path

    def _resolve_rules_path(self) -> Path:
        path = (self._project_root / _DEFAULT_RULES_PATH).resolve()
        if not path.exists() or not path.is_file():
            raise RuntimeError(f"Waste rules file not found: {path}")
        return path

    @staticmethod
    def _resolve_confidence_threshold() -> float:
        raw_value = os.getenv(
            "YOLO_CONFIDENCE_THRESHOLD", str(_DEFAULT_CONFIDENCE_THRESHOLD)
        ).strip()
        try:
            threshold = float(raw_value)
        except ValueError as exc:
            raise RuntimeError(
                "YOLO_CONFIDENCE_THRESHOLD must be a float between 0 and 1"
            ) from exc

        if threshold < 0.0 or threshold > 1.0:
            raise RuntimeError(
                "YOLO_CONFIDENCE_THRESHOLD must be a float between 0 and 1"
            )
        return threshold

    @staticmethod
    def _normalize_label_key(label: str) -> str:
        if not isinstance(label, str):
            return ""
        parts = re.split(r"[\s_-]+", label.strip().lower())
        return "_".join(part for part in parts if part)

    @staticmethod
    def _label_to_readable_text(label: str) -> str:
        normalized = YoloService._normalize_label_key(label)
        if not normalized:
            return "unknown item"
        return normalized.replace("_", " ")

    def _load_rules(self) -> dict[str, dict[str, Any]]:
        try:
            raw_text = self.rules_path.read_text(encoding="utf-8")
        except OSError as exc:
            raise RuntimeError(f"Failed to read waste rules: {exc}") from exc

        try:
            payload = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid waste rules JSON: {exc}") from exc

        if not isinstance(payload, dict):
            raise RuntimeError("Waste rules JSON must be an object")

        normalized_rules: dict[str, dict[str, Any]] = {}
        for raw_label, raw_rule in payload.items():
            if not isinstance(raw_label, str) or not raw_label.strip():
                raise RuntimeError("Waste rules labels must be non-empty strings")
            if not isinstance(raw_rule, dict):
                raise RuntimeError(f"Rule for label '{raw_label}' must be an object")

            missing = _RULE_REQUIRED_FIELDS - set(raw_rule.keys())
            if missing:
                missing_text = ", ".join(sorted(missing))
                raise RuntimeError(
                    f"Rule for label '{raw_label}' is missing fields: {missing_text}"
                )

            item_name = str(raw_rule["item_name"]).strip()
            reason = str(raw_rule["reason"]).strip()
            is_hazardous = raw_rule["is_hazardous"]
            if not item_name:
                raise RuntimeError(f"Rule for label '{raw_label}' has empty item_name")
            if not reason:
                raise RuntimeError(f"Rule for label '{raw_label}' has empty reason")
            if not isinstance(is_hazardous, bool):
                raise RuntimeError(
                    f"Rule for label '{raw_label}' has non-boolean is_hazardous"
                )

            try:
                category = WasteCategory(raw_rule["waste_category"])
            except ValueError as exc:
                raise RuntimeError(
                    f"Rule for label '{raw_label}' has invalid waste_category"
                ) from exc

            try:
                disposal_path = DisposalPath(raw_rule["disposal_path"])
            except ValueError as exc:
                raise RuntimeError(
                    f"Rule for label '{raw_label}' has invalid disposal_path"
                ) from exc

            normalized_label = self._normalize_label_key(raw_label)
            if not normalized_label:
                raise RuntimeError(
                    f"Rule label '{raw_label}' normalizes to an empty key"
                )
            if normalized_label in normalized_rules:
                raise RuntimeError(
                    f"Duplicate normalized rule key detected: '{normalized_label}'"
                )

            normalized_rules[normalized_label] = {
                "item_name": item_name,
                "waste_category": category,
                "disposal_path": disposal_path,
                "reason": reason,
                "is_hazardous": is_hazardous,
            }

        return normalized_rules

    def _get_model(self) -> Any:
        if self._model is None:
            with self._model_lock:
                if self._model is None:
                    if not self.model_path.exists() or not self.model_path.is_file():
                        raise RuntimeError(_MODEL_NOT_FOUND_MESSAGE)

                    try:
                        from ultralytics import YOLO
                    except ImportError as exc:
                        raise RuntimeError(
                            "ultralytics is not installed. Install it to use YOLO inference."
                        ) from exc

                    self._log(f"loading model: {self.model_path}")
                    try:
                        self._model = YOLO(str(self.model_path))
                    except Exception as exc:
                        raise RuntimeError(
                            f"Failed to load YOLO model from {self.model_path}: {exc}"
                        ) from exc

        return self._model

    @staticmethod
    def _normalize_base64_payload(image_base64: str) -> str:
        if not isinstance(image_base64, str) or not image_base64.strip():
            raise ValueError("image_base64 must be a non-empty base64 string")

        normalized = image_base64.strip()
        if normalized.startswith("data:") and "," in normalized:
            normalized = normalized.split(",", 1)[1]
        normalized = "".join(normalized.split())
        if not normalized:
            raise ValueError("image_base64 must be a non-empty base64 string")
        return normalized

    def decode_base64_image(self, image_base64: str) -> Image.Image:
        try:
            normalized = self._normalize_base64_payload(image_base64)
            padded = normalized + ("=" * (-len(normalized) % 4))

            image_bytes = base64.b64decode(padded, validate=True)
            buffer = io.BytesIO(image_bytes)
            with Image.open(buffer) as image:
                image.verify()

            buffer.seek(0)
            with Image.open(buffer) as image:
                rgb_image = image.convert("RGB")

            return rgb_image
        except (binascii.Error, TypeError, ValueError, UnidentifiedImageError, OSError) as exc:
            raise ValueError("image cannot be decoded") from exc

    @staticmethod
    def _to_confidence_level(score: float) -> ConfidenceLevel:
        if score >= 0.75:
            return ConfidenceLevel.high
        if score >= 0.45:
            return ConfidenceLevel.medium
        return ConfidenceLevel.low

    @staticmethod
    def _resolve_label(names: Any, class_id: int) -> str:
        if isinstance(names, dict):
            value = names.get(class_id)
            if value is None:
                value = names.get(str(class_id))
            if value is not None:
                return str(value)
        if isinstance(names, (list, tuple)) and 0 <= class_id < len(names):
            return str(names[class_id])
        return str(class_id)

    def _map_detection_to_waste_item(self, label: str, score: float) -> WasteItem:
        normalized_label = self._normalize_label_key(label)
        rule = self.rules.get(normalized_label)

        if rule is None:
            item_name = self._label_to_readable_text(label)
            waste_category = WasteCategory.dry_recyclable
            disposal_path = DisposalPath.collection_point
            reason = _FALLBACK_REASON
            is_hazardous = False
        else:
            item_name = rule["item_name"]
            waste_category = rule["waste_category"]
            disposal_path = rule["disposal_path"]
            reason = rule["reason"]
            is_hazardous = rule["is_hazardous"]

        return WasteItem(
            item_name=item_name,
            waste_category=waste_category,
            confidence=self._to_confidence_level(float(score)),
            disposal_path=disposal_path,
            reason=reason,
            is_hazardous=is_hazardous,
        )

    def _parse_detections(self, detections: Any, model_names: Any) -> list[WasteItem]:
        items: list[WasteItem] = []
        for detection in detections:
            boxes = getattr(detection, "boxes", None)
            if boxes is None:
                continue

            cls_data = getattr(boxes, "cls", None)
            conf_data = getattr(boxes, "conf", None)
            if cls_data is None or conf_data is None:
                continue

            try:
                class_ids = cls_data.tolist()
                scores = conf_data.tolist()
            except Exception as exc:
                raise RuntimeError(f"Failed to parse YOLO detection tensors: {exc}") from exc

            names = getattr(detection, "names", None) or model_names or {}
            for class_id, score in zip(class_ids, scores):
                idx = int(class_id)
                label = self._resolve_label(names, idx)
                try:
                    item = self._map_detection_to_waste_item(label, float(score))
                except Exception as exc:
                    raise RuntimeError(
                        f"Failed to map detection '{label}' to WasteItem: {exc}"
                    ) from exc
                items.append(item)

        return items

    @staticmethod
    def _log(message: str) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        print(f"[{timestamp}] {message}", flush=True)

    def analyze(self, image_base64: str, uid: str) -> AnalysisResult:
        if not isinstance(uid, str) or not uid.strip():
            raise ValueError("uid is required")

        image = self.decode_base64_image(image_base64)
        self._log("image decoded")
        model = self._get_model()

        self._log("inference started")
        try:
            results = model.predict(
                source=image,
                conf=self.confidence_threshold,
                verbose=False,
            )
        except Exception as exc:
            raise RuntimeError(f"YOLO inference failed: {exc}") from exc

        items = self._parse_detections(results, getattr(model, "names", {}))
        self._log(f"number of detections: {len(items)}")

        result = AnalysisResult(
            items=items,
            total_items_detected=len(items),
            has_organic=any(
                item.waste_category == WasteCategory.wet_organic for item in items
            ),
            has_ewaste=any(item.waste_category == WasteCategory.e_waste for item in items),
            has_hazardous=any(item.is_hazardous for item in items),
        )
        self._log("analysis result built")
        return result


async def analyze_waste_image(image_base64: str, uid: str) -> AnalysisResult:
    service = YoloService()
    return await asyncio.to_thread(service.analyze, image_base64, uid)
