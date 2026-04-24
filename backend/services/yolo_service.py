from __future__ import annotations

import asyncio
import base64
import binascii
import io
import os
import threading
from pathlib import Path
from typing import Any

from PIL import Image, UnidentifiedImageError

from models.waste_schema import (
    AnalysisResult,
    ConfidenceLevel,
    DisposalPath,
    WasteCategory,
    WasteItem,
)

__all__ = ["YoloService", "analyze_waste_image"]

_DEFAULT_MODEL_PATH = Path("backend/models/yolo/best.pt")
_DEFAULT_CONFIDENCE_THRESHOLD = 0.25


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
        self.confidence_threshold = self._resolve_confidence_threshold()
        self._model: Any | None = None
        self._model_lock = threading.Lock()
        self._initialized = True

    def _resolve_model_path(self) -> Path:
        raw_path = os.getenv("YOLO_MODEL_PATH", str(_DEFAULT_MODEL_PATH)).strip()
        path = Path(raw_path).expanduser()
        if not path.is_absolute():
            path = (self._project_root / path).resolve()

        if not path.exists() or not path.is_file():
            raise RuntimeError(f"YOLO model file not found: {path}")
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

    def _get_model(self) -> Any:
        if self._model is None:
            with self._model_lock:
                if self._model is None:
                    try:
                        from ultralytics import YOLO
                    except ImportError as exc:
                        raise RuntimeError(
                            "ultralytics is not installed. Install it to use YOLO inference."
                        ) from exc

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
        normalized = self._normalize_base64_payload(image_base64)
        padded = normalized + ("=" * (-len(normalized) % 4))

        try:
            image_bytes = base64.b64decode(padded, validate=True)
        except (binascii.Error, TypeError, ValueError) as exc:
            raise ValueError("image_base64 must contain valid base64 image data") from exc

        buffer = io.BytesIO(image_bytes)
        try:
            with Image.open(buffer) as image:
                image.verify()
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValueError("Decoded bytes are not a valid image") from exc

        buffer.seek(0)
        try:
            with Image.open(buffer) as image:
                rgb_image = image.convert("RGB")
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValueError("Failed to open decoded image payload") from exc

        return rgb_image

    @staticmethod
    def _to_confidence_level(score: float) -> ConfidenceLevel:
        if score >= 0.75:
            return ConfidenceLevel.high
        if score >= 0.5:
            return ConfidenceLevel.medium
        return ConfidenceLevel.low

    @staticmethod
    def _classify_label(label: str) -> tuple[WasteCategory, DisposalPath, bool, str]:
        normalized = label.lower().replace("-", " ").replace("_", " ").strip()

        hazardous_tokens = (
            "battery",
            "cell",
            "chemical",
            "paint",
            "aerosol",
            "bulb",
            "tube",
            "pesticide",
            "solvent",
            "thermometer",
        )
        medical_tokens = (
            "syringe",
            "needle",
            "medicine",
            "vial",
            "mask",
            "glove",
            "bandage",
            "pill",
            "medical",
        )
        sanitary_tokens = (
            "diaper",
            "sanitary",
            "napkin",
            "pad",
            "tampon",
            "tissue",
            "toilet",
            "wipe",
        )
        e_waste_tokens = (
            "phone",
            "laptop",
            "computer",
            "keyboard",
            "mouse",
            "monitor",
            "charger",
            "cable",
            "earphone",
            "headphone",
            "adapter",
            "remote",
            "electronic",
            "pcb",
        )
        construction_tokens = (
            "brick",
            "concrete",
            "tile",
            "cement",
            "rubble",
            "drywall",
            "plaster",
            "wood",
            "pipe",
            "glass wool",
        )
        wet_organic_tokens = (
            "food",
            "fruit",
            "vegetable",
            "peel",
            "leaf",
            "organic",
            "leftover",
            "compost",
            "garden",
            "banana",
        )
        recyclable_sell_tokens = (
            "bottle",
            "can",
            "newspaper",
            "cardboard",
            "metal",
            "aluminum",
            "plastic",
        )

        if any(token in normalized for token in hazardous_tokens):
            return (
                WasteCategory.hazardous,
                DisposalPath.special_facility,
                True,
                "Potentially dangerous material needs controlled handling at a special facility.",
            )
        if any(token in normalized for token in medical_tokens):
            return (
                WasteCategory.medical,
                DisposalPath.special_facility,
                True,
                "Medical waste may carry contamination risk and needs specialist disposal.",
            )
        if any(token in normalized for token in sanitary_tokens):
            return (
                WasteCategory.sanitary,
                DisposalPath.special_facility,
                True,
                "Sanitary waste needs sealed handling and specialized disposal.",
            )
        if any(token in normalized for token in e_waste_tokens):
            return (
                WasteCategory.e_waste,
                DisposalPath.collection_point,
                False,
                "Electronic component requires authorized e-waste collection and processing.",
            )
        if any(token in normalized for token in construction_tokens):
            return (
                WasteCategory.construction,
                DisposalPath.collection_point,
                False,
                "Construction debris should go to approved debris collection facilities.",
            )
        if any(token in normalized for token in wet_organic_tokens):
            return (
                WasteCategory.wet_organic,
                DisposalPath.compost,
                False,
                "Biodegradable organic waste that decomposes naturally in compost.",
            )
        if any(token in normalized for token in recyclable_sell_tokens):
            return (
                WasteCategory.dry_recyclable,
                DisposalPath.sell,
                False,
                "Dry recyclable material can be sold or routed into recycling streams.",
            )
        if "cloth" in normalized or "book" in normalized or "toy" in normalized:
            return (
                WasteCategory.dry_recyclable,
                DisposalPath.donate,
                False,
                "Reusable dry item can be donated if still in usable condition.",
            )

        return (
            WasteCategory.dry_recyclable,
            DisposalPath.collection_point,
            False,
            "Dry waste should be segregated and sent to a recycling collection point.",
        )

    @staticmethod
    def _normalize_item_name(label: str) -> str:
        item = label.replace("_", " ").replace("-", " ").strip()
        return " ".join(item.split()) or "unknown item"

    def _parse_detections(self, detections: Any, model_names: Any) -> list[WasteItem]:
        items: list[WasteItem] = []
        label_counts: dict[str, int] = {}

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
                raw_label = names.get(idx, str(idx)) if isinstance(names, dict) else str(idx)
                item_name = self._normalize_item_name(raw_label)

                label_counts[item_name] = label_counts.get(item_name, 0) + 1
                if label_counts[item_name] > 1:
                    item_name = f"{item_name} {label_counts[item_name]}"

                category, disposal_path, is_hazardous, reason = self._classify_label(
                    raw_label
                )

                try:
                    item = WasteItem(
                        item_name=item_name,
                        waste_category=category,
                        confidence=self._to_confidence_level(float(score)),
                        disposal_path=disposal_path,
                        reason=reason,
                        is_hazardous=is_hazardous,
                    )
                except Exception as exc:
                    raise RuntimeError(
                        f"Failed to build WasteItem for class '{raw_label}': {exc}"
                    ) from exc
                items.append(item)

        return items

    def analyze(self, image_base64: str, uid: str) -> AnalysisResult:
        if not isinstance(uid, str) or not uid.strip():
            raise ValueError("uid is required")

        image = self.decode_base64_image(image_base64)
        model = self._get_model()

        try:
            results = model.predict(
                source=image,
                conf=self.confidence_threshold,
                verbose=False,
            )
        except Exception as exc:
            raise RuntimeError(f"YOLO inference failed: {exc}") from exc

        items = self._parse_detections(results, getattr(model, "names", {}))
        total = len(items)

        try:
            return AnalysisResult(
                items=items,
                total_items_detected=total,
                has_organic=any(
                    item.waste_category == WasteCategory.wet_organic for item in items
                ),
                has_ewaste=any(
                    item.waste_category == WasteCategory.e_waste for item in items
                ),
                has_hazardous=any(item.is_hazardous for item in items),
            )
        except Exception as exc:
            raise RuntimeError(f"Failed to build analysis result: {exc}") from exc


async def analyze_waste_image(image_base64: str, uid: str) -> AnalysisResult:
    service = YoloService()
    return await asyncio.to_thread(service.analyze, image_base64, uid)
