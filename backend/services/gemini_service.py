"""Service layer that communicates with the Gemini 1.5 Pro Vision API."""

import base64
import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

from models.waste_schema import WasteAnalysisResponse
from utils.prompt_builder import build_waste_analysis_prompt

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialise the model once at module level for reuse across requests.
_model = genai.GenerativeModel("gemini-1.5-pro")


async def analyze_waste_image(
    image_base64: str,
    mime_type: str = "image/jpeg",
) -> WasteAnalysisResponse:
    """Send a base64-encoded image to Gemini Vision and return structured waste data.

    Parameters
    ----------
    image_base64:
        The raw base64 string of the image (no ``data:`` URI prefix).
    mime_type:
        MIME type of the image, defaults to ``image/jpeg``.

    Returns
    -------
    WasteAnalysisResponse
        Validated Pydantic model containing identified waste items.
    """

    image_bytes = base64.b64decode(image_base64)

    image_part = {
        "mime_type": mime_type,
        "data": image_bytes,
    }

    prompt = build_waste_analysis_prompt()

    response = _model.generate_content([prompt, image_part])

    raw_text = response.text.strip()

    # Strip markdown code fences if the model wraps its output.
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1]  # remove opening fence line
    if raw_text.endswith("```"):
        raw_text = raw_text.rsplit("```", 1)[0]
    raw_text = raw_text.strip()

    parsed = json.loads(raw_text)

    return WasteAnalysisResponse(**parsed)
