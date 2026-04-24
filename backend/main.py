from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import reminders, leaderboard, vendors
from services.scheduler_service import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield


app = FastAPI(
    title="WasteWise API - Person 4",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reminders.router, prefix="/api/reminder", tags=["Reminders"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(vendors.router, prefix="/api", tags=["Vendors"])


@app.get("/")
def health():
    return {"status": "WasteWise Person 4 API is running"}