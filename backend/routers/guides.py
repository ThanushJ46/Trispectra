"""
routers/guides.py
GET /api/guides/category/{category}
GET /api/guides/category/ewaste/item?item=laptop
"""
from fastapi import APIRouter, Query
router = APIRouter()

GUIDES_DATA = {
    "wet_organic": {
        "category": "wet_organic",
        "title": "Composting Guide for Your Organic Waste",
        "summary": "Organic waste can be converted into manure instead of being sent to landfill. Composting reduces smell, reduces methane emissions, and gives nutrient-rich manure for plants.",
        "cases": [
            {
                "id": "city", "title": "City / Apartment Composting",
                "explain": "If you live in a city or apartment, you may not have land to dig a pit. You can use a home composting setup.",
                "tools": ["Small compost bin or aerobic compost bucket","Dry leaves, cocopeat, sawdust, or shredded cardboard","Compost starter or microbial culture","Gloves","Small garden fork or turning stick","Tray to collect excess liquid","Optional: charcoal filter bin to reduce smell"],
                "steps": [
                    {"day":"Day 1","desc":"Chop large food pieces into smaller pieces. Add one layer of dry material at bottom. Add organic waste. Cover with dry leaves/cocopeat. Close the bin loosely for airflow."},
                    {"day":"Day 3","desc":"Open and mix the waste. If it smells bad, add more dry leaves/cocopeat. If it is too dry, sprinkle little water."},
                    {"day":"Day 7","desc":"Check moisture. It should feel like a squeezed sponge. Add dry matter if wet. Add water if too dry."},
                    {"day":"Day 14","desc":"Turn the compost again. Avoid adding oily food, meat, fish, and dairy in apartment compost unless using managed composting setup."},
                    {"day":"Day 21-30","desc":"Compost becomes dark and soil-like. Let it cure for a few days. Use for plants."}
                ],
                "tips": ["Keep carbon-rich material ready","Never leave food exposed","Avoid too much cooked food","Use a sealed but ventilated bin","Keep it in balcony or utility area"]
            },
            {
                "id": "village", "title": "Village / Open Land Compost Pit",
                "explain": "If you live in a village or have open space, you can create a compost pit.",
                "tools": ["Shaded place away from drinking water source","Pit: 3ft long, 2ft wide, 2ft deep","Dry leaves, soil, cow dung, or old compost","Rainwater protection"],
                "steps": [
                    {"day":"Step 1","desc":"Add dry leaves or small sticks at the bottom for airflow"},
                    {"day":"Step 2","desc":"Add organic waste layer"},
                    {"day":"Step 3","desc":"Add cow dung or old compost if available"},
                    {"day":"Step 4","desc":"Cover with soil or dry leaves"},
                    {"day":"Step 5","desc":"Repeat layers: dry material, wet waste, soil/cow dung"},
                    {"day":"Step 6","desc":"Turn the pit every 7 to 10 days"},
                    {"day":"Step 7","desc":"Keep moisture balanced. If too dry, sprinkle water. If too wet, add dry leaves or soil"},
                    {"day":"Step 8","desc":"After 30 to 45 days, compost will become dark, crumbly, and earthy-smelling"}
                ],
                "tips": ["Do not add plastic, glass, metal, battery, medicine, or sanitary waste","Cover the pit to avoid animals","Use separate pits for continuous composting"]
            }
        ],
        "importance": {"title":"Importance of manure","points":["Improves soil fertility","Adds nutrients slowly","Improves water retention","Reduces need for chemical fertilizers","Helps vegetables, flowering plants, fruit plants, and kitchen gardens","Reduces landfill waste and bad smell"],"uses":["Kitchen garden","Flower pots","Coconut/arecanut/banana plants","Vegetable farms","Fruit trees","Nursery plants","Campus gardens"]},
        "checkpoints": [
            {"day":1,"instruction":"Start compost bin/pit","points":20,"status":"pending"},
            {"day":3,"instruction":"First turn","points":20,"status":"pending"},
            {"day":7,"instruction":"Moisture check","points":20,"status":"pending"},
            {"day":14,"instruction":"Add dry material and turn","points":20,"status":"pending"},
            {"day":21,"instruction":"Compost progress check","points":20,"status":"pending"},
            {"day":30,"instruction":"Harvest/cure compost","points":20,"status":"pending"}
        ],
        "vendors": [
            {"name":"Daily Dump — Compost Drop & Pick","category":"organic","accepts":["vegetable peels","cooked food","garden waste"],"distance":"2.3 km","phone":"+919900112233"},
            {"name":"Community Composting Hub","category":"organic","accepts":["kitchen waste","garden trimmings"],"distance":"3.1 km","phone":"+919876543210"}
        ],
        "gamification": {"start_journey":20,"per_checkpoint":20,"complete_journey":100,"badges":["Compost Starter","Soil Saver"]}
    },
    "e_waste": {
        "category": "e_waste",
        "title": "E-Waste Guide: Sell, Dismantle, or Recycle Safely",
        "summary": "E-waste contains valuable parts but also harmful materials. It should not be mixed with normal waste.",
        "options": [
            {"id":"sell","title":"Option 1: Sell Whole Device","best_when":["device is working","screen is okay","battery is okay","device can be repaired","user wants quick money"],"estimates":[{"item":"Working laptop","value":"₹5,000 - ₹25,000"},{"item":"Non-working laptop","value":"₹1,000 - ₹5,000"},{"item":"Very old/damaged laptop","value":"₹500 - ₹2,000"},{"item":"Working phone","value":"₹1,000 - ₹15,000"},{"item":"Non-working phone","value":"₹300 - ₹2,000"}]},
            {"id":"dismantle","title":"Option 2: Dismantle and Sell Parts","best_when":["device is not working","some parts are still usable","user wants better value","user can safely remove parts"],"warning":"Only dismantle if you know basic safety. Do not open swollen batteries. Do not break screens. If unsure, give it to a certified vendor.","parts":[{"name":"RAM","value":"₹300 - ₹2,000"},{"name":"SSD/HDD","value":"₹500 - ₹3,000"},{"name":"Charger","value":"₹300 - ₹1,500"},{"name":"Battery","value":"₹300 - ₹2,000"},{"name":"Screen","value":"₹1,000 - ₹5,000"},{"name":"Keyboard","value":"₹300 - ₹1,500"},{"name":"Motherboard","value":"₹500 - ₹4,000"},{"name":"Scrap body","value":"₹100 - ₹500"}],"steps":["Power off device","Remove charger","If possible, remove battery first","Remove back cover screws","Remove RAM/SSD carefully","Do not damage battery or screen","Sort parts into reusable, repairable, and scrap","Take parts to e-waste vendor or repair shop"],"safety":["Do not puncture battery","Do not burn e-waste","Do not throw in normal garbage","Wear gloves","Keep screws and parts separate","Data wipe storage before selling"]}
        ],
        "checkpoints": [{"day":1,"instruction":"Identify and separate e-waste items","points":20,"status":"pending"},{"day":2,"instruction":"Data wipe all storage devices","points":20,"status":"pending"},{"day":3,"instruction":"Contact vendor or collection point","points":30,"status":"pending"},{"day":7,"instruction":"Hand over to certified recycler","points":50,"status":"pending"}],
        "vendors": [{"name":"E-Waste Recyclers India","category":"e_waste","accepts":["laptops","phones","batteries","PCBs","cables"],"distance":"1.8 km","phone":"+918022345678"},{"name":"Attero Recycling — Drop Point","category":"e_waste","accepts":["all electronics","batteries","appliances"],"distance":"4.2 km","phone":"+918066112233"},{"name":"ScrapUncle — Pan-city Pickup","category":"e_waste","accepts":["all scrap","old appliances","metal"],"distance":"Pickup available","phone":"+919611223344"},{"name":"Bangalore Battery Recyclers","category":"e_waste","accepts":["lead-acid batteries","lithium-ion","AA/AAA cells"],"distance":"6.5 km","phone":"+918023001122"}],
        "gamification": {"identified":20,"vendor_selected":30,"safe_disposal":50,"badges":["E-Waste Hero"]}
    },
    "dry_recyclable": {
        "category": "dry_recyclable",
        "title": "Dry & Recyclable Waste Guide",
        "summary": "Dry waste should be clean and separated. Dirty recyclable items may be rejected.",
        "steps": ["Empty the item","Rinse if food/oil residue exists","Dry it","Compress bottle/can if possible","Separate by type: plastic, paper, metal, glass","Give to collection point, scrap vendor, or recycling vendor"],
        "specifics": [{"item":"PET bottle","rules":["remove liquid","crush bottle","keep cap separately if needed"]},{"item":"Can","rules":["rinse","crush safely"]},{"item":"Glass","rules":["wrap broken glass safely","label as glass"]},{"item":"Paper bag","rules":["keep dry","avoid mixing with wet waste"]}],
        "checkpoints": [{"day":1,"instruction":"Sort and clean recyclable items","points":10,"status":"pending"},{"day":2,"instruction":"Separate by material type","points":10,"status":"pending"},{"day":3,"instruction":"Take to collection point or vendor","points":20,"status":"pending"}],
        "vendors": [{"name":"Kabadiwalla Connect","category":"dry_recyclable","accepts":["PET bottles","HDPE","aluminium cans","cardboard","glass bottles"],"distance":"2.1 km","phone":"+917760012345"},{"name":"Hasiru Dala — Cooperative","category":"dry_recyclable","accepts":["all dry recyclables"],"distance":"3.5 km","phone":"+919482100200"},{"name":"Municipal MRF Center","category":"dry_recyclable","accepts":["plastic","paper","metal","glass"],"distance":"5.0 km","phone":"+918012345678"}],
        "gamification": {"item_sorted":10,"vendor_selected":20,"badges":["Recycling Rookie"]}
    },
    "hazardous": {
        "category": "hazardous",
        "title": "Hazardous Waste Safety Guide",
        "summary": "Do not mix this with household waste. Items like batteries, chemicals, bulbs, and paint are highly toxic.",
        "warning": "DANGER: Hazardous waste can cause injury, contamination, or environmental damage if handled improperly.",
        "steps": ["Keep separate from all other waste","Do not break, burn, or puncture","Store in a dry, cool place away from children","Hand over to authorized hazardous waste facility","For battery: tape terminals if possible","For bulb: avoid breaking glass, wrap securely","For paint/chemical container: do not pour leftover liquid into drain"],
        "specifics": [{"item":"Battery","rules":["tape terminals if possible","do not puncture or crush","store in non-metallic container"]},{"item":"Light bulb","rules":["avoid breaking glass","wrap in newspaper","label as fragile/hazardous"]},{"item":"Paint/chemical container","rules":["do not pour leftover liquid into drain","seal container tightly","keep away from heat"]},{"item":"Chemical spray can","rules":["do not puncture","keep away from flames","hand over to facility as-is"]}],
        "checkpoints": [{"day":1,"instruction":"Identify and isolate hazardous items","points":20,"status":"pending"},{"day":2,"instruction":"Secure packaging for safe transport","points":20,"status":"pending"},{"day":3,"instruction":"Hand over to authorized facility","points":50,"status":"pending"}],
        "vendors": [{"name":"BBMP Hazardous Waste Collection","category":"hazardous","accepts":["batteries","chemicals","paints","bulbs"],"distance":"4.0 km","phone":"+918022221111"},{"name":"Bangalore Battery Recyclers — Peenya","category":"hazardous","accepts":["lead-acid batteries","lithium-ion","UPS batteries"],"distance":"6.5 km","phone":"+918023001122"}],
        "gamification": {"identified":20,"safe_disposal":50,"badges":["Hazard Handler"]}
    }
}

# Fallback categories
for _cat in ["medical","construction","sanitary"]:
    if _cat not in GUIDES_DATA:
        GUIDES_DATA[_cat] = {
            "category": _cat,
            "title": f"Disposal Guide: {_cat.replace('_',' ').title()}",
            "summary": f"Please safely pack {_cat.replace('_',' ')} waste and hand it over to specialized municipal collectors.",
            "steps": ["Keep completely separate from dry and wet waste","Pack securely to avoid exposure","Label clearly if needed","Contact your local municipal corporation for specialized pickup"],
            "checkpoints": [{"day":1,"instruction":"Separate and secure waste","points":15,"status":"pending"},{"day":3,"instruction":"Arrange collection or drop-off","points":25,"status":"pending"}],
            "vendors": [],
            "gamification": {"identified":10,"safe_disposal":30,"badges":[]}
        }

EWASTE_ITEM_DATA = {
    "laptop": {"item":"laptop","sell_estimate":{"working":"₹5,000 - ₹25,000","non_working":"₹1,000 - ₹5,000","very_old":"₹500 - ₹2,000"},"parts":[{"name":"RAM","value":"₹300 - ₹2,000"},{"name":"SSD/HDD","value":"₹500 - ₹3,000"},{"name":"Charger","value":"₹300 - ₹1,500"},{"name":"Battery","value":"₹300 - ₹2,000"},{"name":"Screen","value":"₹1,000 - ₹5,000"},{"name":"Keyboard","value":"₹300 - ₹1,500"},{"name":"Motherboard","value":"₹500 - ₹4,000"},{"name":"Scrap body","value":"₹100 - ₹500"}]},
    "phone": {"item":"phone","sell_estimate":{"working":"₹1,000 - ₹15,000","non_working":"₹300 - ₹2,000"},"parts":[{"name":"Screen","value":"₹500 - ₹5,000"},{"name":"Battery","value":"₹200 - ₹1,000"},{"name":"Camera module","value":"₹200 - ₹1,500"},{"name":"Motherboard","value":"₹300 - ₹2,000"}]},
    "charger": {"item":"charger","sell_estimate":{"working":"₹100 - ₹500","non_working":"₹20 - ₹100"},"parts":[]},
    "wire": {"item":"wire","sell_estimate":{"working":"₹50 - ₹300/kg","non_working":"₹30 - ₹200/kg"},"parts":[]}
}

@router.get("/{category}")
def get_guide(category: str):
    if category in GUIDES_DATA:
        return GUIDES_DATA[category]
    return {"category":category,"title":f"Disposal Guide: {category.replace('_',' ').title()}","summary":f"Safely dispose {category.replace('_',' ')} waste via municipal collectors.","steps":["Keep separate","Pack securely","Label clearly","Contact municipal corporation"],"checkpoints":[],"vendors":[],"gamification":{"identified":10,"safe_disposal":30,"badges":[]}}

@router.get("/ewaste/item")
def get_ewaste_item_guide(item: str = Query("laptop")):
    item_lower = item.lower().strip()
    if item_lower in EWASTE_ITEM_DATA:
        return EWASTE_ITEM_DATA[item_lower]
    return {"item":item_lower,"sell_estimate":{"working":"₹100 - ₹2,000","non_working":"₹50 - ₹500"},"parts":[]}
