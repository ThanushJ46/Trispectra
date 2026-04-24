"""WasteWise Vision — FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.vision import router as vision_router

app = FastAPI(
    title="WasteWise Vision API",
    description="AI-powered waste classification using local YOLOv11 detection.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins during development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(vision_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Lightweight liveness probe."""
    return {"status": "ok", "service": "wastewise-vision"}
