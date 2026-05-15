"""
File Manager Utility

Handles temporary file storage and cleanup for the video processing pipeline.
Ensures local video files are properly managed during processing.
"""

import os
import uuid
from pathlib import Path
from typing import Optional


TEMP_VIDEO_DIR = Path(os.environ.get("TEMP_VIDEO_DIR", "/tmp/goviral_videos"))


def ensure_temp_dir() -> Path:
    """Ensure the temporary video directory exists."""
    TEMP_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    return TEMP_VIDEO_DIR


def generate_temp_filename(public_id: str) -> str:
    """Generate a unique temporary filename for the video."""
    unique_id = uuid.uuid4().hex[:8]
    safe_public_id = "".join(c if c.isalnum() or c in "-_" else "_" for c in public_id)
    return f"{safe_public_id}_{unique_id}.mp4"


def get_temp_filepath(public_id: str) -> Path:
    """Get the full path for a temporary video file."""
    ensure_temp_dir()
    filename = generate_temp_filename(public_id)
    return TEMP_VIDEO_DIR / filename


def file_exists(filepath: Path) -> bool:
    """Check if a file exists at the given path."""
    return filepath.exists() and filepath.is_file()


def get_file_size(filepath: Path) -> Optional[int]:
    """Get the size of a file in bytes. Returns None if file doesn't exist."""
    if file_exists(filepath):
        return filepath.stat().st_size
    return None


def cleanup_file(filepath: Path) -> bool:
    """
    Delete a file if it exists.
    
    Args:
        filepath: Path to the file to delete
        
    Returns:
        True if file was deleted or didn't exist, False on error
    """
    try:
        if file_exists(filepath):
            filepath.unlink()
            print(f"Cleaned up temporary file: {filepath}")
        return True
    except Exception as e:
        print(f"Error cleaning up file {filepath}: {e}")
        return False


def cleanup_on_error(filepath: Path) -> None:
    """Cleanup file when an error occurs."""
    if file_exists(filepath):
        cleanup_file(filepath)