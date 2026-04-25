"""
routers/guides.py
──────────────────
GET /api/guides/category/{category} — returns detailed manual/guide data for a waste category
"""

from fastapi import APIRouter, HTTPException

router = APIRouter()

# Static mock data for guides
GUIDES_DATA = {
    "wet_organic": {
        "category": "wet_organic",
        "title": "Composting Guide for Your Organic Waste",
        "summary": "Organic waste can be converted into manure instead of being sent to landfill. Composting reduces smell, reduces methane emissions, and gives nutrient-rich manure for plants.",
        "cases": [
            {
                "id": "city",
                "title": "City / Apartment Composting",
                "explain": "If you live in a city or apartment, you may not have land to dig a pit. You can use a home composting setup.",
                "tools": [
                    "Small compost bin or aerobic compost bucket",
                    "Dry leaves, cocopeat, sawdust, or shredded cardboard",
                    "Compost starter or microbial culture",
                    "Gloves",
                    "Small garden fork or turning stick",
                    "Tray to collect excess liquid",
                    "Optional: charcoal filter bin to reduce smell"
                ],
                "steps": [
                    {"day": "Day 1", "desc": "Chop large food pieces into smaller pieces. Add one layer of dry material at bottom. Add organic waste. Cover with dry leaves/cocopeat. Close the bin loosely for airflow."},
                    {"day": "Day 3", "desc": "Open and mix the waste. If it smells bad, add more dry leaves/cocopeat. If it is too dry, sprinkle little water."},
                    {"day": "Day 7", "desc": "Check moisture. It should feel like a squeezed sponge. Add dry matter if wet. Add water if too dry."},
                    {"day": "Day 14", "desc": "Turn the compost again. Avoid adding oily food, meat, fish, and dairy in apartment compost unless using managed composting setup."},
                    {"day": "Day 21 to 30", "desc": "Compost becomes dark and soil-like. Let it cure for a few days. Use for plants."}
                ],
                "tips": [
                    "Keep carbon-rich material ready",
                    "Never leave food exposed",
                    "Avoid too much cooked food",
                    "Use a sealed but ventilated bin",
                    "Keep it in balcony or utility area"
                ]
            },
            {
                "id": "village",
                "title": "Village / Open Land Compost Pit",
                "explain": "If you live in a village or have open space, you can create a compost pit.",
                "tools": [
                    "Choose a shaded place away from drinking water source",
                    "Dig a pit around 3 feet long, 2 feet wide, 2 feet deep",
                    "Keep some dry leaves, soil, cow dung, or old compost ready",
                    "Do not allow rainwater to flood the pit"
                ],
                "steps": [
                    {"day": "Step 1", "desc": "Add dry leaves or small sticks at the bottom for airflow"},
                    {"day": "Step 2", "desc": "Add organic waste layer"},
                    {"day": "Step 3", "desc": "Add cow dung or old compost if available"},
                    {"day": "Step 4", "desc": "Cover with soil or dry leaves"},
                    {"day": "Step 5", "desc": "Repeat layers: dry material, wet waste, soil/cow dung"},
                    {"day": "Step 6", "desc": "Turn the pit every 7 to 10 days"},
                    {"day": "Step 7", "desc": "Keep moisture balanced. If too dry, sprinkle water. If too wet, add dry leaves or soil"},
                    {"day": "Step 8", "desc": "After 30 to 45 days, compost will become dark, crumbly, and earthy-smelling"}
                ],
                "tips": [
                    "Do not add plastic, glass, metal, battery, medicine, or sanitary waste",
                    "Cover the pit to avoid animals",
                    "Use separate pits for continuous composting"
                ]
            }
        ],
        "importance": {
            "title": "Importance of manure",
            "points": [
                "Improves soil fertility",
                "Adds nutrients slowly",
                "Improves water retention",
                "Reduces need for chemical fertilizers",
                "Helps vegetables, flowering plants, fruit plants, and kitchen gardens",
                "Reduces landfill waste and bad smell"
            ],
            "uses": [
                "Kitchen garden",
                "Flower pots",
                "Coconut/arecanut/banana plants",
                "Vegetable farms",
                "Fruit trees",
                "Nursery plants",
                "Campus gardens"
            ]
        }
    },
    "e_waste": {
        "category": "e_waste",
        "title": "E-Waste Guide: Sell, Dismantle, or Recycle Safely",
        "summary": "E-waste contains valuable parts but also harmful materials. It should not be mixed with normal waste.",
        "options": [
            {
                "id": "sell",
                "title": "Option 1: Sell Whole Device",
                "best_when": ["device is working", "screen is okay", "battery is okay", "device can be repaired", "user wants quick money"],
                "estimates": [
                    {"item": "Working laptop", "value": "₹5,000 - ₹25,000"},
                    {"item": "Non-working laptop", "value": "₹1,000 - ₹5,000"},
                    {"item": "Very old/damaged laptop", "value": "₹500 - ₹2,000"},
                    {"item": "Working phone", "value": "₹1,000 - ₹15,000"},
                    {"item": "Non-working phone", "value": "₹300 - ₹2,000"}
                ]
            },
            {
                "id": "dismantle",
                "title": "Option 2: Dismantle and Sell Parts",
                "best_when": ["device is not working", "some parts are still usable", "user wants better value", "user can safely remove parts"],
                "warning": "Only dismantle if you know basic safety. Do not open swollen batteries. Do not break screens. If unsure, give it to a certified vendor.",
                "parts": [
                    {"name": "RAM", "value": "₹300 - ₹2,000"},
                    {"name": "SSD/HDD", "value": "₹500 - ₹3,000"},
                    {"name": "Charger", "value": "₹300 - ₹1,500"},
                    {"name": "Battery", "value": "₹300 - ₹2,000 if safe and working"},
                    {"name": "Screen", "value": "₹1,000 - ₹5,000"},
                    {"name": "Keyboard", "value": "₹300 - ₹1,500"},
                    {"name": "Motherboard", "value": "₹500 - ₹4,000"},
                    {"name": "Scrap body", "value": "₹100 - ₹500"}
                ],
                "steps": [
                    "Power off device",
                    "Remove charger",
                    "If possible, remove battery first",
                    "Remove back cover screws",
                    "Remove RAM/SSD carefully",
                    "Do not damage battery or screen",
                    "Sort parts into reusable, repairable, and scrap",
                    "Take parts to e-waste vendor or repair shop"
                ],
                "safety": [
                    "Do not puncture battery",
                    "Do not burn e-waste",
                    "Do not throw in normal garbage",
                    "Wear gloves",
                    "Keep screws and parts separate",
                    "Data wipe storage before selling"
                ]
            }
        ]
    },
    "dry_recyclable": {
        "category": "dry_recyclable",
        "title": "Dry & Recyclable Waste Guide",
        "summary": "Dry waste should be clean and separated. Dirty recyclable items may be rejected.",
        "steps": [
            "Empty the item",
            "Rinse if food/oil residue exists",
            "Dry it",
            "Compress bottle/can if possible",
            "Separate by type: plastic, paper, metal, glass",
            "Give to collection point, scrap vendor, or recycling vendor"
        ],
        "specifics": [
            {"item": "PET bottle", "rules": ["remove liquid", "crush bottle", "keep cap separately if needed"]},
            {"item": "Can", "rules": ["rinse", "crush safely"]},
            {"item": "Glass", "rules": ["wrap broken glass safely", "label as glass"]},
            {"item": "Paper bag", "rules": ["keep dry", "avoid mixing with wet waste"]}
        ]
    },
    "hazardous": {
        "category": "hazardous",
        "title": "Hazardous Waste Safety Guide",
        "summary": "Do not mix this with household waste. Items like batteries, chemicals, bulbs, and paint are highly toxic.",
        "steps": [
            "Keep separate",
            "Do not break, burn, or puncture",
            "Store in dry place",
            "Hand over to authorized hazardous waste facility"
        ],
        "specifics": [
            {"item": "Battery", "rules": ["tape terminals if possible"]},
            {"item": "Bulb", "rules": ["avoid breaking glass"]},
            {"item": "Paint/chemical container", "rules": ["do not pour leftover liquid into drain"]}
        ]
    }
}

@router.get("/{category}")
def get_guide(category: str):
    if category in GUIDES_DATA:
        return GUIDES_DATA[category]
    
    # Fallback for medical, construction, sanitary
    return {
        "category": category,
        "title": f"Disposal Guide: {category.replace('_', ' ').title()}",
        "summary": f"Please safely pack {category.replace('_', ' ')} waste and hand it over to specialized municipal collectors. Do not mix with regular household waste.",
        "steps": [
            "Keep completely separate from dry and wet waste.",
            "Pack securely to avoid exposure.",
            "Label clearly if needed.",
            "Contact your local municipal corporation for specialized pickup."
        ]
    }
