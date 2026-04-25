"""
routers/reminders.py
────────────────────
POST /api/reminder/schedule  — schedule checkpoint reminders for a user
GET  /api/reminder/{uid}     — view a user's reminder schedule
POST /api/reminder/test      — manually trigger a test WhatsApp message
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from datetime import datetime
from services.firestore_service import save_reminder_schedule, create_journey, get_user_journey
import re

router = APIRouter()

CHECKPOINT_DAYS = [1, 3, 7, 21]  # composting journey milestones


# ── Schemas ───────────────────────────────────────────────────────────────────

class ScheduleRequest(BaseModel):
    uid: str
    journey_start_date: datetime    # ISO8601 string auto-parsed by Pydantic
    waste_type: str = "organic"
    items: list[str] = []           # e.g. ["banana peel", "vegetable scraps"]
    primary_item: str = "organic waste"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/schedule")
def schedule_reminders(body: ScheduleRequest):
    """
    Creates a composting journey and schedules WhatsApp reminders
    for Day 1, 3, 7, and 21.
    """
    if body.uid == "demo-user":
        return {
            "success": True,
            "uid": body.uid,
            "journey_start": body.journey_start_date.isoformat(),
            "checkpoints_scheduled": CHECKPOINT_DAYS,
            "reminders_saved": len(CHECKPOINT_DAYS),
            "message": f"Reminders scheduled for days {CHECKPOINT_DAYS}. WhatsApp messages will fire automatically.",
        }

    # Prevent duplicate journeys
    existing = get_user_journey(body.uid)
    if existing and existing.get("status") == "active":
        raise HTTPException(
            status_code=409,
            detail="User already has an active journey. Complete or reset it first.",
        )

    # Create journey doc
    create_journey(
        uid=body.uid,
        phone="",
        start_date=body.journey_start_date,
        waste_type=body.waste_type,
        items=body.items,
    )

    # Save reminder schedule to Firestore
    saved = save_reminder_schedule(
        uid=body.uid,
        phone="",
        journey_start=body.journey_start_date,
        checkpoints=CHECKPOINT_DAYS,
    )

    # Enrich with item_name for the scheduler to use
    try:
        from firebase_admin import firestore as fs
        db_client = fs.client()
        for reminder in saved:
            day = reminder["day"]
            doc_path = f"reminders/{body.uid}/schedule/day_{day}"
            db_client.document(doc_path).update({"item_name": body.primary_item})
    except Exception as e:
        print(f"[Reminders] Error enriching schedule: {e}")

    return {
        "success": True,
        "uid": body.uid,
        "journey_start": body.journey_start_date.isoformat(),
        "checkpoints_scheduled": CHECKPOINT_DAYS,
        "reminders_saved": len(saved),
        "message": f"Reminders scheduled for days {CHECKPOINT_DAYS}. WhatsApp messages will fire automatically.",
    }


@router.get("/{uid}")
def get_reminder_schedule(uid: str):
    """View a user's scheduled reminders and journey status."""
    if uid == "demo-user":
        # Return mock journey for demo user
        return {
            "uid": uid,
            "journey": {
                "uid": uid,
                "status": "active",
                "start_date": datetime.utcnow().isoformat(),
                "waste_type": "organic",
                "checkpoints": {
                    "1": {"status": "completed"},
                    "3": {"status": "pending"}
                }
            },
            "checkpoint_days": CHECKPOINT_DAYS,
        }
        
    journey = get_user_journey(uid)
    if not journey:
        raise HTTPException(status_code=404, detail="No active journey found for this user.")

    return {
        "uid": uid,
        "journey": journey,
        "checkpoint_days": CHECKPOINT_DAYS,
    }