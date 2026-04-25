"""
scheduler_service.py
────────────────────
APScheduler job that runs every hour, checks Firestore for
due reminders, and fires Twilio WhatsApp messages.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.firestore_service import get_due_reminders, mark_reminder_sent
from services.twilio_service import send_reminder
import logging

logger = logging.getLogger("wastewise.scheduler")
_scheduler = None


def _process_due_reminders():
    """Core job: fetch due reminders → send WhatsApp → update status."""
    logger.info("Scheduler: checking for due reminders...")
    due = get_due_reminders()

    if not due:
        logger.info("Scheduler: no reminders due.")
        return

    for reminder in due:
        phone     = reminder.get("phone")
        day       = reminder.get("day")
        item_name = reminder.get("item_name", "your waste")
        doc_path  = reminder.get("_doc_path")

        result = send_reminder(phone=phone, day=day, item_name=item_name)

        new_status = "sent" if result["success"] else "failed"
        mark_reminder_sent(doc_path, status=new_status)

        if result["success"]:
            logger.info(f"✅ Reminder sent to {phone} for Day {day}. SID: {result['sid']}")
        else:
            logger.error(f"❌ Failed to send to {phone} Day {day}: {result['error']}")


def start_scheduler():
    """Call once on FastAPI startup."""
    global _scheduler
    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _process_due_reminders,
        trigger=IntervalTrigger(hours=1),
        id="reminder_job",
        replace_existing=True,
        max_instances=1,
    )
    _scheduler.start()
    logger.info("🕐 Reminder scheduler started (runs every hour).")


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()