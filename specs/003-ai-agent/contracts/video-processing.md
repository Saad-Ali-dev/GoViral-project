# API Contract: Video Processing

## Endpoint: Process Video

### POST /api/videos/process

**Description**: Initiates video processing pipeline - downloads from Cloudinary and uploads to Gemini Files API

**Request**:
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: [optional auth key]`
- **Body**:
```json
{
  "cloudinary_url": "string (required)",
  "video_id": "string (required)",
  "user_id": "string (required)",
  "public_id": "string (required)"
}
```

**Response (202 Accepted)**:
```json
{
  "success": true,
  "message": "Video processing initiated",
  "video_id": "string"
}
```

**Response (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "string - error message"
}
```

---

## Processing Page

### GET /processing

**Description**: Frontend page displaying processing status

**Behavior**:
- Displays centered box with #212121 background color
- Shows bot-animation.mp4 in loop
- Displays status text: "Processing your video..."
- No real-time updates (generic message until complete)

---

## Data Flow

```
[User uploads video]
       ↓
[Next.js uploads to Cloudinary]
       ↓
[Next.js stores video data in MongoDB]
       ↓
[Next.js calls POST /api/videos/process]
       ↓
[Python backend downloads from Cloudinary]
       ↓
[Python backend uploads to Gemini Files API]
       ↓
[Python backend returns result]
       ↓
[Next.js displays result to user]
```