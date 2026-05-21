# API Contracts: AI Agents Pipeline

## POST /api/pipeline/start

Initiates the AI pipeline for a video. Returns immediately with pipeline ID.

**Request**:
```json
{
  "videoId": "string (MongoDB ObjectId)",
  "userId": "string (MongoDB ObjectId)",
  "gemini_file_id": "string (Gemini Files API reference)"
}
```

**Response (202 Accepted)**:
```json
{
  "success": true,
  "pipelineId": "string (MongoDB ObjectId)",
  "status": "pending",
  "message": "Pipeline initiated"
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid videoId or userId"
}
```

**Response (409 Conflict)**:
```json
{
  "success": false,
  "error": "Pipeline already running for this video"
}
```

---

## GET /api/pipeline/status/{videoId}

Polling endpoint for pipeline progress. Called by Next.js frontend every 2-3 seconds.

**Request**: Path parameter `videoId`

**Response (200 OK)**:
```json
{
  "success": true,
  "videoId": "string",
  "status": "pending | security_checking | security_failed | seo_generating | completed | error",
  "current_stage": "security_check | seo_generation | complete",
  "progress_percentage": 0-100,
  "security_result": true | false | null,
  "seo_result": {
    "viral_score": 0-100,
    "title": "string",
    "description": "string",
    "tags": ["string"],
    "category_id": "string",
    "category_name": "string"
  } | null,
  "error": "string | null",
  "updated_at": "ISO 8601 timestamp"
}
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "No pipeline found for this video"
}
```

---

## POST /api/videos/process (Python Agent Backend)

Existing endpoint extended to trigger pipeline after video upload to Gemini.

**Request**:
```json
{
  "cloudinary_url": "string",
  "video_id": "string",
  "user_id": "string",
  "public_id": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "status": "complete",
  "message": "Video processed successfully",
  "gemini_file_id": "string",
  "video_id": "string"
}
```

---

## POST /api/agents/security (Python Agent Backend)

NEW: Security check agent endpoint. Receives Gemini file ID and returns boolean.

**Request**:
```json
{
  "gemini_file_id": "string",
  "video_id": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "passed": true,
  "video_id": "string"
}
```

OR

```json
{
  "success": true,
  "passed": false,
  "video_id": "string"
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Security check failed to process"
}
```

---

## POST /api/agents/seo (Python Agent Backend)

NEW: SEO generator agent endpoint. Receives Gemini file ID and returns SEO package.

**Request**:
```json
{
  "gemini_file_id": "string",
  "video_id": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "seo_result": {
    "viral_score": 75,
    "title": "Amazing Short Video About Cats",
    "description": "Discover the cutest cat moments...",
    "tags": ["cats", "cute", "pets", "animals"],
    "category_id": "15",
    "category_name": "Pets & Animals"
  },
  "video_id": "string"
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "SEO generation failed"
}
```
