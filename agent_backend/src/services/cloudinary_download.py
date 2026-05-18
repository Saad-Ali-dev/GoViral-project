"""
Cloudinary Download Service

Downloads videos from Cloudinary for processing.
Uses streaming download for memory efficiency with large files.
"""

import requests
from pathlib import Path
from typing import Optional, Tuple
import time


DEFAULT_TIMEOUT = 60
CHUNK_SIZE = 8192


def download_video(
    cloudinary_url: str,
    output_path: Path,
    timeout: int = DEFAULT_TIMEOUT,
    max_retries: int = 3,
) -> Tuple[bool, Optional[str]]:
    """
    Download a video from Cloudinary to local storage.
    
    Args:
        cloudinary_url: Full URL to the video on Cloudinary
        output_path: Local path where the video will be saved
        timeout: Request timeout in seconds
        max_retries: Maximum number of retry attempts
        
    Returns:
        Tuple of (success: bool, error_message: Optional[str])
    """
    if not cloudinary_url:
        return False, "Cloudinary URL is empty"
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            response = requests.get(
                cloudinary_url,
                stream=True,
                timeout=timeout,
                allow_redirects=True,
            )
            
            if response.status_code == 404:
                return False, "Video not found on Cloudinary"
            
            if response.status_code != 200:
                return False, f"Failed to download: HTTP {response.status_code}"
            
            content_type = response.headers.get("content-type", "")
            if "video" not in content_type and "application/octet-stream" not in content_type:
                print(f"Warning: Unexpected content type: {content_type}")
            
            total_size = int(response.headers.get("content-length", 0))
            downloaded = 0
            
            with open(output_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        if total_size > 0:
                            progress = (downloaded / total_size) * 100
                            if downloaded % (CHUNK_SIZE * 10) == 0:
                                print(f"Download progress: {progress:.1f}%")
            
            print(f"Video downloaded successfully: {output_path}")
            return True, None
            
        except requests.exceptions.Timeout:
            last_error = f"Download timeout after {timeout}s (attempt {attempt + 1}/{max_retries})"
            print(f"Timeout error: {last_error}")
            
        except requests.exceptions.RequestException as e:
            last_error = f"Download failed: {str(e)} (attempt {attempt + 1}/{max_retries})"
            print(f"Request error: {last_error}")
            
        except IOError as e:
            last_error = f"Failed to write file: {str(e)}"
            print(f"IO error: {last_error}")
            break
        
        if attempt < max_retries - 1:
            wait_time = (attempt + 1) * 2
            print(f"Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
    
    return False, last_error or "Download failed after all retries"


def is_valid_cloudinary_url(url: str) -> bool:
    """Check if a URL appears to be a valid Cloudinary video URL."""
    if not url:
        return False
    
    valid_prefixes = [
        "https://res.cloudinary.com/",
        "https://cloudinary.com/",
    ]
    
    return any(url.startswith(prefix) for prefix in valid_prefixes)