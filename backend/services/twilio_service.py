"""
twilio_service.py
─────────────────
Sends WhatsApp reminders via Twilio Sandbox.
Handles Day 1, 3, 7, 21 composting checkpoints.
"""

import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# ── Credentials (set in .env) ─────────────────────────────────────────────────
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN")
FROM_NUMBER  = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")  # Sandbox default

# ── Message templates per checkpoint day ─────────────────────────────────────
CHECKPOINT_TEMPLATES = {
    1: (
        "🌱 *WasteWise Day 1 Reminder*\n\n"
        "Time to start your composting journey for *{item_name}*!\n\n"
        "✅ *Today's task:* Add your organic waste to your compost bin.\n"
        "📍 Make sure it's in a shaded spot with good airflow.\n\n"
        "Open WasteWise to log Day 1 ➜ {app_url}\n"
        "_You've got this! 💪_"
    ),
    3: (
        "🔄 *WasteWise Day 3 Reminder*\n\n"
        "Your *{item_name}* compost needs attention!\n\n"
        "✅ *Today's task:* Turn the pile to add oxygen.\n"
        "💡 Tip: Mix brown material (dry leaves) if it smells.\n\n"
        "Log Day 3 on WasteWise ➜ {app_url}\n"
        "_Earn 50 points for completing this checkpoint!_"
    ),
    7: (
        "💧 *WasteWise Day 7 Reminder*\n\n"
        "One week in — great work with *{item_name}*!\n\n"
        "✅ *Today's task:* Check moisture level.\n"
        "👉 Should feel like a wrung-out sponge — not too wet, not too dry.\n\n"
        "Log Day 7 on WasteWise ➜ {app_url}\n"
        "_Your leaderboard rank is climbing! 🏆_"
    ),
    21: (
        "🎉 *WasteWise Day 21 — Harvest Day!*\n\n"
        "Your *{item_name}* compost is ready to harvest!\n\n"
        "✅ *Today's task:* Check if compost is dark, crumbly & earthy-smelling.\n"
        "🌿 Use it on plants, donate it, or share with neighbours.\n\n"
        "Log your harvest on WasteWise ➜ {app_url}\n"
        "_You've diverted waste from landfill. India thanks you! 🇮🇳_"
    ),
}

APP_URL = os.getenv("APP_URL", "https://wastewise.vercel.app")


def send_reminder(phone: str, day: int, item_name: str) -> dict:
    """
    Send a WhatsApp reminder for the given checkpoint day.

    Args:
        phone:     E.164 format, e.g. '+919876543210'
        day:       Checkpoint day (1, 3, 7, or 21)
        item_name: Human-readable waste item, e.g. 'banana peels'

    Returns:
        dict with 'success', 'sid', and 'error' keys.
    """
    if day not in CHECKPOINT_TEMPLATES:
        return {
            "success": False,
            "sid": None,
            "error": f"No template for day {day}. Valid days: {list(CHECKPOINT_TEMPLATES.keys())}",
        }

    template = CHECKPOINT_TEMPLATES[day]
    body = template.format(item_name=item_name, app_url=APP_URL)
    to_number = f"whatsapp:{phone}" if not phone.startswith("whatsapp:") else phone

    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=FROM_NUMBER,
            to=to_number,
        )
        return {"success": True, "sid": message.sid, "error": None}

    except TwilioRestException as e:
        return {"success": False, "sid": None, "error": str(e)}


def send_custom_message(phone: str, body: str) -> dict:
    """Utility — send any WhatsApp message (for testing)."""
    to_number = f"whatsapp:{phone}" if not phone.startswith("whatsapp:") else phone
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        message = client.messages.create(body=body, from_=FROM_NUMBER, to=to_number)
        return {"success": True, "sid": message.sid}
    except TwilioRestException as e:
        return {"success": False, "sid": None, "error": str(e)}