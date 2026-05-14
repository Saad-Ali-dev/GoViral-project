# Research: AI Agent Processing Pipeline

## Decision: Gemini Files API Upload Method

**Decision**: Use `google.genai.Client` with `client.files.upload()` method

**Rationale**: The latest langchain-google-genai library uses the Google GenAI client which provides a clean `files.upload()` API. This is the recommended approach per LangChain Google documentation and directly supports video file uploads.

**Alternatives considered**:
- Direct REST API calls to Gemini Files API - More complex, requires manual header management
- Using `upload_file()` method from older versions - Deprecated in favor of `files.upload()`

### Code Pattern

```python
from google import genai

client = genai.Client()
myfile = client.files.upload(file='path/to/video.mp4')

# Use the file in content generation
response = client.models.generate_content(
    model='gemini-2.0-flash',
    contents=[myfile, 'analyze this video']
)
```

---

## Decision: Cloudinary Video Download

**Decision**: Use Python `requests` library with streaming download

**Rationale**: Cloudinary provides direct URL access to video files. Streaming download ensures memory efficiency for large video files.

**Alternatives considered**:
- Cloudinary SDK - Adds unnecessary dependency; URL-based download is sufficient
- urllib - requests provides better error handling and timeout management

### Code Pattern

```python
import requests

def download_video(url: str, output_path: str) -> bool:
    response = requests.get(url, stream=True, timeout=60)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    return False
```

---

## Decision: API Endpoint Design

**Decision**: Single POST endpoint `/process-video` that accepts video metadata and returns processing result

**Rationale**: This aligns with the workflow where Next.js sends video data after Cloudinary upload completes. The endpoint handles both download and upload in one flow for simplicity.

**Endpoints**:
- `POST /process-video` - Initiates video processing pipeline

---

## Decision: Frontend-Backend Communication

**Decision**: REST API with client-side redirect pattern

**Rationale**: Per clarification session, Next.js receives processing-start response and performs `window.location.href = '/processing'` redirect. Frontend shows generic "Processing your video..." message while backend completes work.

---

## Key Findings

1. **Gemini API**: Use `google.genai.Client` with `files.upload()` - latest recommended method
2. **Cloudinary**: Use `requests.get()` with streaming for efficient download
3. **Error Handling**: Return appropriate error codes to frontend for user feedback
4. **File Cleanup**: Delete local video file after Gemini upload completes (success or failure)
5. **Railway Constraints**: Keep memory usage under 0.5GB; stream large files instead of loading into memory