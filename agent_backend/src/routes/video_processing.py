"""
Video Processing API Route

Handles POST requests to process videos through the AI pipeline:
1. Download video from Cloudinary
2. Upload to Gemini Files API
3. Clean up local file

This endpoint receives video metadata from Next.js after successful upload.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.services.cloudinary_download import download_video, is_valid_cloudinary_url
from src.services.gemini_upload import upload_video_to_gemini
from src.utils.file_manager import (
    cleanup_file,
    get_file_size,
    get_temp_filepath,
)

router = APIRouter()


class VideoProcessRequest(BaseModel):
    """Request model for video processing endpoint."""

    cloudinary_url: str = Field(..., description="Full URL to video on Cloudinary")
    video_id: str = Field(..., description="MongoDB video document ID")
    user_id: str = Field(..., description="User who uploaded the video")
    public_id: str = Field(..., description="Cloudinary public ID for the video")


class VideoProcessResponse(BaseModel):
    """Response model for video processing endpoint."""

    success: bool
    status: str
    message: str | None = None
    gemini_file_id: str | None = None
    error: str | None = None
    video_id: str | None = None


@router.post("/videos/process", response_model=VideoProcessResponse)
async def process_video(request: VideoProcessRequest) -> VideoProcessResponse:
    """
    Process a video through the AI pipeline.

    Steps:
    1. Validate Cloudinary URL
    2. Download video to local storage
    3. Upload to Gemini Files API
    4. Clean up local file

    Returns processing status with Gemini file reference on success.
    """
    print(
        f"Processing video request: video_id={request.video_id}, user_id={request.user_id}"
    )

    if not is_valid_cloudinary_url(request.cloudinary_url):
        return VideoProcessResponse(
            success=False,
            status="failed",
            error="Invalid Cloudinary URL",
        )

    local_path = get_temp_filepath(request.public_id)
    print(f"Downloading video to: {local_path}")

    download_success, download_error = download_video(
        request.cloudinary_url,
        local_path,
    )

    if not download_success:
        print(f"Download failed: {download_error}")
        return VideoProcessResponse(
            success=False,
            status="failed",
            error=f"Failed to download video: {download_error}",
            video_id=request.video_id,
        )

    file_size = get_file_size(local_path)
    print(f"Downloaded file size: {file_size} bytes")

    try:
        gemini_file_id, upload_error = upload_video_to_gemini(local_path)

        if upload_error:
            print(f"Gemini upload failed: {upload_error}")
            cleanup_file(local_path)
            return VideoProcessResponse(
                success=False,
                status="failed",
                error=f"Failed to upload to Gemini: {upload_error}",
                video_id=request.video_id,
            )

        print(f"Successfully processed video: gemini_file_id={gemini_file_id}")

        cleanup_file(local_path)

        return VideoProcessResponse(
            success=True,
            status="complete",
            message="Video processed successfully",
            gemini_file_id=gemini_file_id,
            video_id=request.video_id,
        )

    except Exception as e:
        error_msg = f"Processing error: {str(e)}"
        print(error_msg)

        cleanup_file(local_path)

        return VideoProcessResponse(
            success=False,
            status="failed",
            error=error_msg,
            video_id=request.video_id,
        )


@router.get("/videos/process/{video_id}/status")
async def get_processing_status(video_id: str) -> dict:
    """
    Get the processing status for a video.

    Note: Current implementation returns static status since we're not
    storing processing state. This endpoint can be expanded for
    real-time status tracking if needed.
    """
    return {
        "video_id": video_id,
        "status": "processing",
        "message": "Video is being processed",
    }
