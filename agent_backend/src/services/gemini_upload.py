"""
Gemini Upload Service

Uploads downloaded videos to Google Gemini Files API for AI processing.
Uses the google-generativeai client with files.upload() method.
"""

import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv()

MAX_RETRIES = 3
RETRY_DELAY = 2


def get_gemini_client():
    """Get configured Gemini client using API key from environment."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    return genai.Client(api_key=api_key)


def upload_video_to_gemini(
    video_path: Path,
    display_name: str | None = None,
) -> tuple[str | None, str | None]:
    """
    Upload a video file to Google Gemini Files API.

    Args:
        video_path: Path to the video file to upload
        display_name: Optional display name for the file in Gemini

    Returns:
        Tuple of (gemini_file_id: Optional[str], error_message: Optional[str])
    """
    if not video_path.exists():
        return None, f"Video file not found: {video_path}"

    if not video_path.is_file():
        return None, f"Path is not a file: {video_path}"

    file_size = video_path.stat().st_size
    if file_size == 0:
        return None, "Video file is empty"

    if file_size > 50 * 1024 * 1024:
        return None, f"Video file exceeds 50MB limit (size: {file_size} bytes)"

    if display_name is None:
        display_name = f"goviral_video_{video_path.stem}"

    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            print(f"Uploading to Gemini (attempt {attempt + 1}/{MAX_RETRIES})...")

            client = get_gemini_client()

            myfile = client.files.upload(
                file=str(video_path),
            )

            print(f"Video uploaded to Gemini successfully: {myfile.name}")
            return myfile.name, None

        except Exception as e:
            error_msg = str(e)
            last_error = f"Gemini upload failed: {error_msg}"
            print(f"Upload error (attempt {attempt + 1}/{MAX_RETRIES}): {error_msg}")

            if attempt < MAX_RETRIES - 1:
                wait_time = RETRY_DELAY * (attempt + 1)
                print(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)

    return None, last_error or "Gemini upload failed after all retries"


def upload_video_for_analysis(
    video_path: Path,
    prompt: str = "Analyze this video and describe its content, identify key themes, and suggest relevant tags and descriptions.",
) -> tuple[str | None, str | None]:
    """
    Upload a video to Gemini and get it ready for content analysis.

    Args:
        video_path: Path to the video file
        prompt: Analysis prompt to use with the video

    Returns:
        Tuple of (gemini_file_id: Optional[str], error_message: Optional[str])
    """
    file_id, error = upload_video_to_gemini(video_path)

    if error:
        return None, error

    return file_id, None
