from __future__ import annotations

import asyncio
import base64
import binascii
import io
import os
import time
from datetime import datetime, timezone
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError

from models.waste_schema import AnalysisResult, WasteItem
from utils.prompt_builder import build_waste_prompt, validate_gemini_response

try:
    load_dotenv()
except Exception as exc:
    raise RuntimeError(str(exc)) from exc

__all__ = ["GeminiService", "get_gemini_service", "analyze_waste_image"]

_service_instance: GeminiService | None = None


class GeminiService:
    def __init__(self) -> None:
        try:
            api_key = os.getenv("GEMINI_API_KEY")
        except Exception as exc:
            raise RuntimeError(str(exc)) from exc

        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set in environment")

        try:
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
        except Exception as exc:
            raise RuntimeError(str(exc)) from exc

        self.model_name = model_name.strip() or "gemini-2.5-pro"

        try:
            genai.configure(api_key=api_key)
        except Exception as exc:
            raise RuntimeError(str(exc)) from exc

        try:
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as exc:
            raise RuntimeError(str(exc)) from exc

        self.generation_config: dict[str, Any] = {
            "temperature": 0.1,
            "top_p": 0.95,
            "max_output_tokens": 2048,
        }

    @staticmethod
    def _log(message: str) -> None:
        timestamp = datetime.now(timezone.utc).isoformat()
        print(f"[{timestamp}] {message}", flush=True)

    def decode_base64_image(self, image_base64: str) -> Image.Image:
        if not isinstance(image_base64, str) or not image_base64.strip():
            raise ValueError("image cannot be decoded")

        normalized = image_base64.strip()
        if normalized.startswith("data:") and "," in normalized:
            normalized = normalized.split(",", 1)[1]
        normalized = "".join(normalized.split())
        padded = normalized + ("=" * (-len(normalized) % 4))

        try:
            image_bytes = base64.b64decode(padded, validate=True)
        except (binascii.Error, ValueError, TypeError) as exc:
            raise ValueError("image cannot be decoded") from exc

        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
            image = image.copy()
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValueError("image cannot be decoded") from exc

        try:
            resampling = (
                Image.Resampling.LANCZOS
                if hasattr(Image, "Resampling")
                else Image.LANCZOS
            )
            image.thumbnail((1024, 1024), resampling)
        except Exception as exc:
            raise ValueError("image cannot be decoded") from exc

        return image

    def analyze_waste(self, image_base64: str) -> dict[str, Any]:
        self._log("Starting Gemini waste analysis")

        try:
            image = self.decode_base64_image(image_base64)
        except Exception as exc:
            self._log(f"Image decode failed: {exc}")
            raise

        self._log(
            f"Image decoded successfully at {image.size[0]}x{image.size[1]}"
        )

        try:
            prompt = build_waste_prompt()
        except Exception as exc:
            self._log(f"Prompt construction failed: {exc}")
            raise

        self._log("Prompt constructed")
        self._log(f"Using Gemini model: {self.model_name}")

        original_error: Exception | None = None
        raw_text = ""

        for attempt in range(2):
            try:
                self._log(f"Calling Gemini model, attempt {attempt + 1}")
                response = self.model.generate_content(
                    [prompt, image],
                    generation_config=self.generation_config,
                )
                raw_text = response.text
            except Exception as exc:
                self._log(f"Gemini call failed on attempt {attempt + 1}: {exc}")
                if original_error is None:
                    original_error = exc
                if attempt == 0:
                    self._log("Retrying Gemini call after 2 seconds")
                    try:
                        time.sleep(2)
                    except Exception as sleep_exc:
                        self._log(f"Retry sleep failed: {sleep_exc}")
                        raise RuntimeError(str(original_error)) from original_error
                    continue
                raise RuntimeError(str(original_error)) from original_error

            self._log("Gemini response received")
            break

        try:
            parsed = validate_gemini_response(raw_text)
        except Exception as exc:
            self._log(f"Gemini response validation failed: {exc}")
            raise

        self._log("Gemini response parsed successfully")
        return parsed

    def build_analysis_result(
        self, raw_dict: dict[str, Any], uid: str
    ) -> AnalysisResult:
        if not isinstance(uid, str) or not uid.strip():
            raise ValueError("uid is required")
        if not isinstance(raw_dict, dict):
            raise ValueError("raw_dict must be a dictionary")

        items_payload = raw_dict.get("items")
        if not isinstance(items_payload, list):
            raise ValueError("items must be a list")
        if not items_payload:
            raise ValueError("items list is empty")

        items: list[WasteItem] = []
        for item_payload in items_payload:
            try:
                item = WasteItem(**item_payload)
            except Exception as exc:
                raise ValueError(str(exc)) from exc
            items.append(item)

        has_organic = any(
            item.waste_category.value == "wet_organic" for item in items
        )
        has_ewaste = any(item.waste_category.value == "e_waste" for item in items)
        has_hazardous = any(item.is_hazardous for item in items)

        try:
            return AnalysisResult(
                items=items,
                total_items_detected=len(items),
                has_organic=has_organic,
                has_ewaste=has_ewaste,
                has_hazardous=has_hazardous,
            )
        except Exception as exc:
            raise ValueError(str(exc)) from exc


def get_gemini_service() -> GeminiService:
    global _service_instance

    if _service_instance is None:
        _service_instance = GeminiService()

    return _service_instance


async def analyze_waste_image(image_base64: str, uid: str) -> AnalysisResult:
    service = get_gemini_service()
    raw_dict = await asyncio.to_thread(service.analyze_waste, image_base64)
    return await asyncio.to_thread(service.build_analysis_result, raw_dict, uid)
