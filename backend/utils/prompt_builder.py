import json


def build_waste_prompt() -> str:
    return """Analyze the provided waste image and identify every visible item individually.

For each visible item, return exactly one object inside the "items" array.
Each item must include:
- "item_name": short item name
- "waste_category": exactly one of ["wet_organic", "dry_recyclable", "e_waste", "hazardous", "medical", "construction", "sanitary"]
- "confidence": exactly one of ["high", "medium", "low"]
- "disposal_path": exactly one of ["compost", "sell", "donate", "collection_point", "special_facility"]
- "reason": one short single-line explanation
- "is_hazardous": true if the item needs special handling, otherwise false

Identify EVERY visible waste item individually. Do not group multiple items into one entry.

Return ONLY valid JSON.
Do not return prose.
Do not return explanations outside JSON.
Do not return markdown.
Do not wrap the JSON in backticks.
Do not include any keys other than "items".

Return JSON in exactly this structure:
{
  "items": [
    {
      "item_name": "banana peel",
      "waste_category": "wet_organic",
      "confidence": "high",
      "disposal_path": "compost",
      "reason": "Organic matter suitable for home composting",
      "is_hazardous": false
    }
  ]
}

If no waste items are visible, return:
{
  "items": []
}"""


def build_waste_analysis_prompt() -> str:
    return build_waste_prompt()


def validate_gemini_response(raw_text: str) -> dict:
    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    if cleaned.startswith("`") and cleaned.endswith("`") and len(cleaned) >= 2:
        cleaned = cleaned[1:-1].strip()

    try:
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, TypeError, ValueError) as exc:
        raise ValueError("Gemini returned invalid JSON") from exc

    if not isinstance(parsed, dict):
        raise ValueError("Gemini returned invalid JSON")

    return parsed


if __name__ == "__main__":
    print(build_waste_prompt())
