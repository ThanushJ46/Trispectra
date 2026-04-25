from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging and Error Handling
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"[API] {request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[GLOBAL ERROR] {request.method} {request.url.path} - {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )

# Your routes
app.include_router(reminders.router, prefix="/api/reminder", tags=["Reminders"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["Reminders (Alias)"])
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