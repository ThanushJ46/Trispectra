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
    "https://trispectra.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local network testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"[API] {request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
    return response

# Global Exception Handler (Task 10)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": request.url.path
        },
    )

# Health Check (Task 11)
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "WasteWise API",
        "environment": "huggingface" if os.getenv("SPACE_ID") else "local"
    }

# Vision Status (Task 11)
@app.get("/api/vision/status", tags=["Diagnostics"])
async def vision_status():
    from services.yolo_service import YoloService
    try:
        import ultralytics
        ultralytics_available = True
    except ImportError:
        ultralytics_available = False
        
    try:
        import torch
        torch_available = True
    except ImportError:
        torch_available = False

    service = YoloService()
    return {
        "ultralytics_available": ultralytics_available,
        "torch_available": torch_available,
        "python_version": sys.version,
        "cwd": os.getcwd(),
        "rules_file_found": service.rules_path.exists(),
        "rules_file_path": str(service.rules_path),
        "models": [
            {"path": str(p), "exists": p.exists(), "size_mb": round(p.stat().st_size / (1024*1024), 2) if p.exists() else 0}
            for p in service.model_paths
        ]
    }

# Include routers
app.include_router(reminders.router, prefix="/api/reminder", tags=["Reminders"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(vendors.router, prefix="/api", tags=["Vendors"])
app.include_router(guides_router, prefix="/api/guides/category", tags=["Guides"])
app.include_router(vision_router)

@app.get("/")
async def root():
    return {"message": "WasteWise API is running. Visit /health for status."}