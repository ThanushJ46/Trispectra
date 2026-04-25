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

_DEFAULT_MODEL_PATHS = [
    Path("backend/models/yolo/waste_best.pt"),
    Path("backend/models/yolo/laptop_best.pt"),
    Path("backend/models/yolo/organic_best.pt"),
    Path("backend/models/yolo/best.pt"),
]
_DEFAULT_RULES_PATH = Path("backend/config/waste_rules.json")
_DEFAULT_GLOBAL_CONFIDENCE_THRESHOLD = 0.25
_MODEL_DEFAULT_CONFIDENCE_THRESHOLDS = {
    "laptop_best.pt": 0.30,
    "organic_best.pt": 0.90,
    "waste_best.pt": 0.25,
    "best.pt": 0.25,
}
_MODEL_SPECIFIC_CONFIDENCE_ENV_VARS = {
    "laptop_best.pt": "YOLO_LAPTOP_CONFIDENCE_THRESHOLD",
    "organic_best.pt": "YOLO_ORGANIC_CONFIDENCE_THRESHOLD",
    "waste_best.pt": "YOLO_WASTE_CONFIDENCE_THRESHOLD",
}
_DEFAULT_IMAGE_SIZE = 640
_IOU_DEDUP_THRESHOLD = 0.6
_FALLBACK_REASON = "Detected item needs manual disposal verification"
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
        self.debug = self._resolve_debug_mode()
        self.model_paths = self._resolve_candidate_model_paths()
        self.rules_path = self._resolve_rules_path()
        (
            self.global_confidence_threshold,
            self._has_global_confidence_override,
        ) = self._resolve_global_confidence_threshold()
        self.image_size = self._resolve_image_size()
        self.rules = self._load_rules()

        self._models: list[tuple[Path, Any]] | None = None
        self._model_lock = threading.Lock()
        self._initialized = True

    @staticmethod
    def _log(message: str) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        print(f"[{timestamp}] {message}", flush=True)

    def _debug_log(self, message: str) -> None:
        if self.debug:
            self._log(message)

    @staticmethod
    def _resolve_debug_mode() -> bool:
        raw = os.getenv("YOLO_DEBUG", "").strip().lower()
        return raw in {"1", "true", "yes", "on"}

    def _resolve_candidate_model_paths(self) -> list[Path]:
        raw_multi = os.getenv("YOLO_MODEL_PATHS", "").strip()
        raw_single = os.getenv("YOLO_MODEL_PATH", "").strip()

        if raw_multi:
            raw_paths = [part.strip() for part in raw_multi.split(",") if part.strip()]
        elif raw_single:
            raw_paths = [raw_single]
        else:
            raw_paths = [str(path) for path in _DEFAULT_MODEL_PATHS]

        resolved: list[Path] = []
        seen: set[str] = set()
        for raw_path in raw_paths:
            path = Path(raw_path).expanduser()
            if not path.is_absolute():
                path = (self._project_root / path).resolve()

            key = str(path)
            if key in seen:
                continue
            seen.add(key)
            resolved.append(path)
        return resolved

    def _resolve_rules_path(self) -> Path:
        path = (self._project_root / _DEFAULT_RULES_PATH).resolve()
        if not path.exists() or not path.is_file():
            raise RuntimeError(f"Waste rules file not found: {path}")
        return path

    @staticmethod
    def _parse_threshold(raw_value: str, env_var_name: str) -> float:
        try:
            threshold = float(raw_value)
        except ValueError as exc:
            raise RuntimeError(f"{env_var_name} must be a float between 0 and 1") from exc

        if threshold < 0.0 or threshold > 1.0:
            raise RuntimeError(f"{env_var_name} must be a float between 0 and 1")
        return threshold

    def _resolve_global_confidence_threshold(self) -> tuple[float, bool]:
        raw_value = os.getenv("YOLO_CONFIDENCE_THRESHOLD", "").strip()
        if not raw_value:
            return _DEFAULT_GLOBAL_CONFIDENCE_THRESHOLD, False
        return self._parse_threshold(raw_value, "YOLO_CONFIDENCE_THRESHOLD"), True

    def _resolve_model_confidence_threshold(self, model_path: Path) -> float:
        model_key = model_path.name.lower()
        specific_env = _MODEL_SPECIFIC_CONFIDENCE_ENV_VARS.get(model_key)
        if specific_env:
            specific_raw_value = os.getenv(specific_env, "").strip()
            if specific_raw_value:
                return self._parse_threshold(specific_raw_value, specific_env)

        if self._has_global_confidence_override:
            return self.global_confidence_threshold

        return _MODEL_DEFAULT_CONFIDENCE_THRESHOLDS.get(
            model_key,
            self.global_confidence_threshold,
        )

    @staticmethod
    def _resolve_image_size() -> int:
        raw_value = os.getenv("YOLO_IMAGE_SIZE", str(_DEFAULT_IMAGE_SIZE)).strip()
        try:
            image_size = int(raw_value)
        except ValueError as exc:
            raise RuntimeError("YOLO_IMAGE_SIZE must be a positive integer") from exc

        if image_size <= 0:
            raise RuntimeError("YOLO_IMAGE_SIZE must be a positive integer")
        return image_size

    @staticmethod
    def normalize_label(label: str) -> str:
        if not isinstance(label, str):
            return ""
        lowered = label.strip().lower()
        lowered = re.sub(r"[^a-z0-9]+", "_", lowered)
        lowered = re.sub(r"_+", "_", lowered)
        return lowered.strip("_")

    @staticmethod
    def _label_to_readable_text(label: str) -> str:
        normalized = YoloService.normalize_label(label)
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

            normalized_label = self.normalize_label(raw_label)
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

    def _get_models(self) -> list[tuple[Path, Any]]:
        if self._models is None:
            with self._model_lock:
                if self._models is None:
                    try:
                        from ultralytics import YOLO
                    except ImportError as exc:
                        raise RuntimeError(
                            "ultralytics is not installed. Install it to use YOLO inference."
                        ) from exc

                    loaded_models: list[tuple[Path, Any]] = []
                    existing_files = 0

                    for model_path in self.model_paths:
                        exists = model_path.exists() and model_path.is_file()
                        self._log(
                            f"[YOLO] candidate model path: {model_path} exists={exists}"
                        )
                        if not exists:
                            self._log(
                                f"[YOLO] warning: model file missing, skipping: {model_path}"
                            )
                            continue

                        existing_files += 1

                        if model_path.stat().st_size == 0:
                            self._log(
                                f"[YOLO] warning: YOLO model file is empty, skipping: {model_path}"
                            )
                            continue

                        self._log(f"[YOLO] loading model: {model_path}")
                        try:
                            model = YOLO(str(model_path))
                            loaded_models.append((model_path, model))
                        except Exception as exc:
                            self._log(
                                "[YOLO] warning: failed to load model, skipping: "
                                f"{model_path} ({exc})"
                            )

                    if existing_files == 0:
                        raise RuntimeError(
                            "No YOLO model files found. Place models in backend/models/yolo/"
                        )
                    if not loaded_models:
                        raise RuntimeError(
                            "No YOLO models could be loaded. Check model file validity."
                        )

                    self._models = loaded_models
        return self._models

    @staticmethod
    def _normalize_base64_payload(image_base64: str) -> str:
        if not isinstance(image_base64, str) or not image_base64.strip():
            raise ValueError("image cannot be decoded")

        normalized = image_base64.strip()
        if normalized.startswith("data:") and "," in normalized:
            normalized = normalized.split(",", 1)[1]
        normalized = "".join(normalized.split())
        if not normalized:
            raise ValueError("image cannot be decoded")
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

    def _map_detection_to_waste_item(self, normalized_label: str, score: float) -> WasteItem:
        rule = self.rules.get(normalized_label)
        if rule is None:
            item_name = self._label_to_readable_text(normalized_label)
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

    @staticmethod
    def _iou(
        box_a: tuple[float, float, float, float],
        box_b: tuple[float, float, float, float],
    ) -> float:
        ax1, ay1, ax2, ay2 = box_a
        bx1, by1, bx2, by2 = box_b

        inter_x1 = max(ax1, bx1)
        inter_y1 = max(ay1, by1)
        inter_x2 = min(ax2, bx2)
        inter_y2 = min(ay2, by2)

        inter_w = max(0.0, inter_x2 - inter_x1)
        inter_h = max(0.0, inter_y2 - inter_y1)
        inter_area = inter_w * inter_h
        if inter_area <= 0:
            return 0.0

        area_a = max(0.0, ax2 - ax1) * max(0.0, ay2 - ay1)
        area_b = max(0.0, bx2 - bx1) * max(0.0, by2 - by1)
        denom = area_a + area_b - inter_area
        if denom <= 0:
            return 0.0
        return inter_area / denom

    @staticmethod
    def _deduplicate_detections(detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
        sorted_detections = sorted(
            detections,
            key=lambda det: float(det["score"]),
            reverse=True,
        )
        kept: list[dict[str, Any]] = []
        for detection in sorted_detections:
            is_duplicate = False
            for existing in kept:
                if detection["label"] != existing["label"]:
                    continue
                overlap = YoloService._iou(detection["box"], existing["box"])
                if overlap >= _IOU_DEDUP_THRESHOLD:
                    is_duplicate = True
                    break
            if not is_duplicate:
                kept.append(detection)
        return kept

    def _extract_detections_for_model(
        self,
        model_path: Path,
        model_conf_threshold: float,
        results: Any,
        model_names: Any,
    ) -> list[dict[str, Any]]:
        extracted: list[dict[str, Any]] = []
        result_count = len(results) if results is not None else 0

        self._debug_log(f"[YOLO] model: {model_path}")
        self._debug_log(f"[YOLO] names: {model_names}")
        self._debug_log(f"[YOLO] conf threshold: {model_conf_threshold}")
        self._debug_log(f"[YOLO] image size used for inference: {self.image_size}")
        self._debug_log(f"[YOLO] raw result count: {result_count}")

        for result in results:
            boxes = getattr(result, "boxes", None)
            if boxes is None:
                self._debug_log("[YOLO] boxes found: 0")
                continue

            cls_data = getattr(boxes, "cls", None)
            conf_data = getattr(boxes, "conf", None)
            xyxy_data = getattr(boxes, "xyxy", None)
            if cls_data is None or conf_data is None or xyxy_data is None:
                self._debug_log("[YOLO] boxes found: 0")
                continue

            try:
                class_ids = cls_data.tolist()
                scores = conf_data.tolist()
                coords = xyxy_data.tolist()
            except Exception as exc:
                raise RuntimeError(f"Failed to parse YOLO detection tensors: {exc}") from exc

            boxes_found = min(len(class_ids), len(scores), len(coords))
            self._debug_log(f"[YOLO] boxes found: {boxes_found}")

            names = getattr(result, "names", None) or model_names or {}
            for class_id, score, coord in zip(class_ids, scores, coords):
                if not isinstance(coord, (list, tuple)) or len(coord) < 4:
                    self._debug_log("[YOLO] skipped detection: invalid bbox format")
                    continue

                score_value = float(score)
                if score_value < model_conf_threshold:
                    self._debug_log(
                        "[YOLO] filtered low-confidence detection: "
                        f"model={model_path.name} score={score_value:.4f} "
                        f"threshold={model_conf_threshold}"
                    )
                    continue

                idx = int(class_id)
                original_label = self._resolve_label(names, idx)
                normalized_label = self.normalize_label(original_label) or "unknown_item"
                x1, y1, x2, y2 = (
                    float(coord[0]),
                    float(coord[1]),
                    float(coord[2]),
                    float(coord[3]),
                )
                bbox_list = [x1, y1, x2, y2]

                self._debug_log(
                    "[YOLO] detection: "
                    f"class_id={idx} label={original_label} "
                    f"normalized={normalized_label} conf={score_value:.4f} "
                    f"bbox={bbox_list}"
                )

                if x2 <= x1 or y2 <= y1:
                    self._debug_log(
                        "[YOLO] skipped detection: invalid bbox geometry "
                        f"bbox={bbox_list}"
                    )
                    continue

                extracted.append(
                    {
                        "label": normalized_label,
                        "score": score_value,
                        "box": (x1, y1, x2, y2),
                    }
                )
        return extracted

    def analyze(self, image_base64: str, uid: str) -> AnalysisResult:
        if not isinstance(uid, str) or not uid.strip():
            raise ValueError("uid is required")

        image = self.decode_base64_image(image_base64)
        self._log("[YOLO] image decoded")

        models = self._get_models()
        self._log(
            "[YOLO] inference started "
            f"(imgsz={self.image_size}, global_fallback_conf={self.global_confidence_threshold})"
        )

        merged_detections: list[dict[str, Any]] = []
        inference_errors: list[str] = []
        successful_runs = 0

        for model_path, model in models:
            model_conf_threshold = self._resolve_model_confidence_threshold(model_path)
            self._log(
                f"[YOLO] model threshold: {model_path.name} -> {model_conf_threshold}"
            )
            try:
                results = model.predict(
                    source=image,
                    conf=model_conf_threshold,
                    imgsz=self.image_size,
                    verbose=False,
                )
                successful_runs += 1
                model_detections = self._extract_detections_for_model(
                    model_path=model_path,
                    model_conf_threshold=model_conf_threshold,
                    results=results,
                    model_names=getattr(model, "names", {}),
                )
                self._log(
                    f"[YOLO] detections from {model_path.name}: {len(model_detections)}"
                )
                merged_detections.extend(model_detections)
            except Exception as exc:
                error_text = f"{model_path.name}: {exc}"
                inference_errors.append(error_text)
                self._log(f"[YOLO] warning: inference failed for model {model_path}: {exc}")

        if successful_runs == 0:
            details = " | ".join(inference_errors) if inference_errors else "no models ran"
            raise RuntimeError(f"YOLO inference failed: {details}")

        self._log(f"[YOLO] total merged detections: {len(merged_detections)}")
        deduped_detections = self._deduplicate_detections(merged_detections)
        self._log(f"[YOLO] number of detections: {len(deduped_detections)}")

        items: list[WasteItem] = []
        for detection in deduped_detections:
            items.append(
                self._map_detection_to_waste_item(
                    normalized_label=str(detection["label"]),
                    score=float(detection["score"]),
                )
            )

        result = AnalysisResult(
            items=items,
            total_items_detected=len(items),
            has_organic=any(
                item.waste_category == WasteCategory.wet_organic for item in items
            ),
            has_ewaste=any(item.waste_category == WasteCategory.e_waste for item in items),
            has_hazardous=any(
                item.is_hazardous or item.waste_category == WasteCategory.hazardous
                for item in items
            ),
        )
        self._log("[YOLO] analysis result built")
        return result


async def analyze_waste_image(image_base64: str, uid: str) -> AnalysisResult:
    service = YoloService()
    return await asyncio.to_thread(service.analyze, image_base64, uid)
