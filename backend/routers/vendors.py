"""
routers/vendors.py
──────────────────
GET /api/vendors?category=e_waste    — list vendors/collection points by category
GET /api/vendors/categories          — list all available categories

Mock data covers 5-6 Bengaluru-area collection points per waste category.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import json, os

router = APIRouter()

# ── Load vendor data ──────────────────────────────────────────────────────────

_DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/vendors.json")

def _load_vendors() -> dict:
    with open(_DATA_PATH, "r") as f:
        return json.load(f)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/vendors")
def get_vendors(
    category: Optional[str] = Query(None, description="e.g. e_waste, plastic, organic, clothes, metal"),
    city: Optional[str] = Query("bengaluru", description="City filter (currently only bengaluru)"),
):
    """
    Returns vendor/collection points filtered by waste category.
    If no category given, returns all vendors.
    """
    data = _load_vendors()
    vendors = data.get("vendors", [])

    if category:
        category_lower = category.lower().replace(" ", "_").replace("-", "_")
        vendors = [v for v in vendors if category_lower in v.get("categories", [])]

    if not vendors:
        raise HTTPException(
            status_code=404,
            detail=f"No vendors found for category '{category}'. Try: e_waste, plastic, clothes, metal, organic",
        )

    return {
        "city": city,
        "category": category,
        "count": len(vendors),
        "vendors": vendors,
    }


@router.get("/vendors/categories")
def get_categories():
    """Return all supported waste categories with vendor counts."""
    data = _load_vendors()
    vendors = data.get("vendors", [])

    category_map: dict[str, int] = {}
    for v in vendors:
        for cat in v.get("categories", []):
            category_map[cat] = category_map.get(cat, 0) + 1

    return {
        "categories": [
            {"name": cat, "vendor_count": count}
            for cat, count in sorted(category_map.items())
        ]
    }