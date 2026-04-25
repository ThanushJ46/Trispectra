"""
routers/leaderboard.py
──────────────────────
GET /api/leaderboard          — top 10 users globally
GET /api/user/{uid}/stats     — personal impact stats
POST /api/user/{uid}/checkpoint — mark a checkpoint complete (used by frontend)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firestore_service import (
    get_leaderboard_top10,
    get_user_stats,
    update_checkpoint,
)

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class CheckpointRequest(BaseModel):
    day: int
    status: str = "completed"   # completed | skipped

class ProfileUpdate(BaseModel):
    display_name: str

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/leaderboard")
def leaderboard():
    """
    Returns the top 10 users ranked by total impact points.
    Safe to call from frontend — phone numbers are stripped.
    """
    top10 = get_leaderboard_top10()
    return {
        "leaderboard": top10,
        "total_ranked": len(top10),
        "metric": "total_points",
    }


@router.get("/user/{uid}/stats")
def user_stats(uid: str):
    """
    Returns personal impact stats for a user.
    Includes kg_diverted, points, trees_equivalent, bottles_rescued.
    """
    stats = get_user_stats(uid)
    if not stats:
        # Return zeroed stats for new users (don't 404)
        return {
            "uid": uid,
            "total_points": 0,
            "kg_diverted": 0.0,
            "items_disposed": 0,
            "streak_days": 0,
            "trees_equivalent": 0.0,
            "bottles_rescued": 0,
            "message": "No activity yet. Start your first journey!",
        }
    stats["uid"] = uid
    return stats


@router.post("/user/{uid}/checkpoint")
def complete_checkpoint(uid: str, body: CheckpointRequest):
    """
    Called by the frontend when a user marks a checkpoint done.
    Awards points and updates the leaderboard.
    """
    result = update_checkpoint(uid=uid, day=body.day, status=body.status)
    return {
        "success": True,
        **result,
        "message": f"Day {body.day} marked as {body.status}. +{result['points_earned']} points!",
    }

@router.get("/user/{uid}/profile")
def get_profile(uid: str):
    """Return user profile."""
    if uid == "demo-user":
        return {
            "uid": uid,
            "displayName": "Demo User",
            "points": 1200,
            "level": 3,
            "streak_days": 3,
            "badges": ["Compost Master"],
            "isDemo": True
        }
    
    # Try fetching from leaderboard doc
    from services.firestore_service import _get_db
    db = _get_db()
    if db:
        doc = db.collection("leaderboard").document(uid).get()
        if doc.exists:
            data = doc.to_dict()
            return {
                "uid": uid,
                "displayName": data.get("display_name", "User"),
                "points": data.get("total_points", 0),
                "level": 1,
                "streak_days": data.get("streak_days", 0),
                "badges": [],
                "isDemo": False
            }
            
    return {
        "uid": uid,
        "displayName": "User",
        "points": 0,
        "level": 1,
        "streak_days": 0,
        "badges": [],
        "isDemo": False
    }

@router.post("/user/{uid}/profile")
def update_profile(uid: str, body: ProfileUpdate):
    """Called after login to store display name."""
    if uid == "demo-user":
        return {"success": True}
        
    from services.firestore_service import _get_db
    db = _get_db()
    if db:
        db.collection("leaderboard").document(uid).set(
            {"display_name": body.display_name, "uid": uid},
            merge=True
        )
    return {"success": True}