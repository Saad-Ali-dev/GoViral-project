"""
GoViral Agent Backend - FastAPI Application

This service handles video processing for the GoViral platform.
It receives video metadata from Next.js, downloads videos from Cloudinary,
and uploads them to Google Gemini Files API for AI processing.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.routes.video_processing import router as video_processing_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    print("GoViral Agent Backend starting up...")
    yield
    print("GoViral Agent Backend shutting down...")


app = FastAPI(
    title="GoViral Agent Backend",
    description="AI Processing Pipeline for GoViral video SEO optimization",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video_processing_router, prefix="/api", tags=["video-processing"])


@app.get("/")
async def root():
    """Root endpoint returning service status."""
    return {
        "service": "GoViral Agent Backend",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for Railway deployment."""
    return {
        "status": "healthy",
        "service": "go-viral-agent",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)