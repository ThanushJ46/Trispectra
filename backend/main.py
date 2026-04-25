from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import reminders, leaderboard, vendors
from routers.vision import router as vision_router
from routers.guides import router as guides_router
from services.scheduler_service import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


app = FastAPI(
    title="WasteWise API",
    description="AI-powered waste classification + reminders + leaderboard + vendors",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your routes
app.include_router(reminders.router, prefix="/api/reminder", tags=["Reminders"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(vendors.router, prefix="/api", tags=["Vendors"])
app.include_router(guides_router, prefix="/api/guides/category", tags=["Guides"])

# Vision route
app.include_router(vision_router)

# Health Check
@app.get("/", tags=["Health"])
def health():
    return {"status": "WasteWise API is running"}

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "WasteWise backend"
    }