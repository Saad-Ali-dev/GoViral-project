# Data Model: AI Agent Processing Pipeline

## Entities

### 1. VideoData (Input from Next.js)

**Purpose**: Contains video metadata passed from Next.js to Python backend

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cloudinary_url | string | Yes | Full URL to video on Cloudinary |
| video_id | string | Yes | MongoDB video document ID |
| user_id | string | Yes | User who uploaded the video |
| public_id | string | Yes | Cloudinary public ID for the video |

**Source**: Received via REST API POST body from Next.js

---

### 2. ProcessingJob (Backend State)

**Purpose**: Tracks video processing status through pipeline stages

| Field | Type | Description |
|-------|------|-------------|
| status | enum | Current processing stage |
| video_id | string | Reference to input video |
| gemini_file_id | string | Gemini Files API ID (after upload) |
| error_message | string | Error details if failed |
| created_at | timestamp | Processing start time |
| completed_at | timestamp | Processing completion time |

**State Transitions**:
```
pending → downloading → uploading → processing → complete
                          ↓
                        failed
```

---

### 3. GeminiFileRef (Output)

**Purpose**: Reference to uploaded video in Gemini Files API

| Field | Type | Description |
|-------|------|-------------|
| name | string | Gemini file name/identifier |
| uri | string | Gemini file URI for reference |
| mime_type | string | Video MIME type (video/mp4, etc.) |

---

### 4. LocalVideoFile (Temporary)

**Purpose**: Tracks temporary video file on local server

| Field | Type | Description |
|-------|------|-------------|
| path | string | Full path to temp video file |
| size_bytes | integer | File size in bytes |
| cleanup_status | enum | pending, cleaned, failed |

---

## API Request/Response

### POST /process-video

**Request Body**:
```json
{
  "cloudinary_url": "https://res.cloudinary.com/demo/video/upload/sample.mp4",
  "video_id": "507f1f77bcf86cd799439011",
  "user_id": "507f1f77bcf86cd799439012",
  "public_id": "demo/sample_video"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "status": "complete",
  "gemini_file_id": "files/abc123",
  "message": "Video processed successfully"
}
```

**Response (Processing Started)**:
```json
{
  "success": true,
  "status": "processing_started",
  "message": "Video processing initiated"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "status": "failed",
  "error": "Failed to download video from Cloudinary"
}
```