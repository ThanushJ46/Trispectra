"""
firestore_service.py
────────────────────
All Firestore read/write helpers for WasteWise Person 4.
Collections used:
  - analyses/{uid}/items[]          ← written by Person 2 (vision)
  - journeys/{uid}                  ← composting journey state
  - reminders/{uid}/schedule[]      ← checkpoint reminder docs
  - leaderboard/{uid}               ← points + impact stats
"""

import os
from datetime import datetime
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

# ── Init ──────────────────────────────────────────────────────────────────────
_initialized = False

def _get_db():
    global _initialized
    if not _initialized:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _initialized = True
    return firestore.client()


# ── Analysis (written by Person 2, read here) ─────────────────────────────────

def get_latest_analysis(uid: str) -> Optional[dict]:
    """Fetch the most recent waste analysis for a user."""
    db = _get_db()
    docs = (
        db.collection("analyses")
        .document(uid)
        .collection("items")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(1)
        .stream()
    )
    for doc in docs:
        return doc.to_dict()
    return None


# ── Journey (composting checkpoints) ─────────────────────────────────────────

def save_analysis(uid: str, analysis_data: dict) -> str:
    """
    Save a waste analysis result to Firestore.
    Returns the document ID.
    """
    db = _get_db()
    ref = db.collection("analyses").document(uid).collection("items").document()
    analysis_data["created_at"] = datetime.utcnow()
    ref.set(analysis_data)
    return ref.id


def get_user_journey(uid: str) -> Optional[dict]:
    """Return the active composting journey for a user."""
    db = _get_db()
    doc = db.collection("journeys").document(uid).get()
    return doc.to_dict() if doc.exists else None


def update_checkpoint(uid: str, day: int, status: str = "completed") -> dict:
    """
    Mark a checkpoint day as completed/pending.
    Also awards points and updates leaderboard doc.
    """
    db = _get_db()
    journey_ref = db.collection("journeys").document(uid)
    journey = journey_ref.get().to_dict() or {}

    checkpoints = journey.get("checkpoints", {})
    checkpoints[str(day)] = {
        "status": status,
        "completed_at": datetime.utcnow() if status == "completed" else None,
    }
    journey_ref.set({"checkpoints": checkpoints}, merge=True)

    # Award points
    points_earned = 50 if status == "completed" else 0
    _add_points(uid, points_earned, f"checkpoint_day_{day}")

    return {"uid": uid, "day": day, "status": status, "points_earned": points_earned}


def create_journey(uid: str, phone: str, start_date: datetime, waste_type: str, items: list) -> dict:
    """Create a new composting journey document."""
    db = _get_db()
    journey_data = {
        "uid": uid,
        "phone": phone,
        "start_date": start_date,
        "waste_type": waste_type,
        "items": items,
        "checkpoints": {},
        "status": "active",
        "created_at": datetime.utcnow(),
    }
    db.collection("journeys").document(uid).set(journey_data)
    return journey_data


# ── Leaderboard ───────────────────────────────────────────────────────────────

def _add_points(uid: str, points: int, reason: str):
    """Internal helper — add points to leaderboard doc."""
    if points <= 0:
        return
    db = _get_db()
    lb_ref = db.collection("leaderboard").document(uid)
    lb_doc = lb_ref.get()

    if lb_doc.exists:
        current = lb_doc.to_dict()
        lb_ref.update({
            "total_points": firestore.Increment(points),
            "kg_diverted": firestore.Increment(_points_to_kg(points)),
            "last_updated": datetime.utcnow(),
        })
    else:
        lb_ref.set({
            "uid": uid,
            "total_points": points,
            "kg_diverted": _points_to_kg(points),
            "items_disposed": 0,
            "streak_days": 0,
            "last_updated": datetime.utcnow(),
        })


def _points_to_kg(points: int) -> float:
    """Rough conversion: 50 points ≈ 0.5 kg diverted."""
    return round(points * 0.01, 2)


def get_leaderboard_top10() -> list:
    """Return top 10 users sorted by total_points."""
    db = _get_db()
    docs = (
        db.collection("leaderboard")
        .order_by("total_points", direction=firestore.Query.DESCENDING)
        .limit(10)
        .stream()
    )
    results = []
    for rank, doc in enumerate(docs, start=1):
        data = doc.to_dict()
        data["rank"] = rank
        # Never expose raw phone numbers in leaderboard
        data.pop("phone", None)
        results.append(data)
    return results


def get_user_stats(uid: str) -> Optional[dict]:
    """Return personal impact stats for a user."""
    db = _get_db()
    doc = db.collection("leaderboard").document(uid).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    kg = data.get("kg_diverted", 0)
    data["trees_equivalent"] = round(kg * 0.05, 2)   # 1 tree ~ absorbs 20 kg CO2/yr
    data["bottles_rescued"] = int(kg / 0.025)          # avg PET bottle ~ 25g
    return data


# ── Reminders ────────────────────────────────────────────────────────────────

def save_reminder_schedule(uid: str, phone: str, journey_start: datetime, checkpoints: list[int]) -> list:
    """
    Persist the reminder schedule to Firestore.
    checkpoints: list of day numbers, e.g. [1, 3, 7, 21]
    """
    db = _get_db()
    saved = []
    for day in checkpoints:
        from datetime import timedelta
        fire_date = journey_start + timedelta(days=day)
        doc_ref = (
            db.collection("reminders")
            .document(uid)
            .collection("schedule")
            .document(f"day_{day}")
        )
        reminder_doc = {
            "uid": uid,
            "phone": phone,
            "day": day,
            "fire_date": fire_date,
            "status": "pending",   # pending | sent | failed
            "created_at": datetime.utcnow(),
        }
        doc_ref.set(reminder_doc)
        saved.append(reminder_doc)
    return saved


def get_due_reminders() -> list:
    """
    Called by the scheduler every hour.
    Returns all pending reminders whose fire_date <= now.
    """
    db = _get_db()
    now = datetime.utcnow()
    results = []

    # We query the top-level 'reminders' collection group
    all_schedules = db.collection_group("schedule").where(
        "status", "==", "pending"
    ).where(
        "fire_date", "<=", now
    ).stream()

    for doc in all_schedules:
        data = doc.to_dict()
        data["_doc_path"] = doc.reference.path
        results.append(data)

    return results


def mark_reminder_sent(doc_path: str, status: str = "sent"):
    """Update reminder status after attempting to send."""
    db = _get_db()
    db.document(doc_path).update({
        "status": status,
        "sent_at": datetime.utcnow(),
    })