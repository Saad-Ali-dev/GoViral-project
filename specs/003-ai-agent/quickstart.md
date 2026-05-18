# Quickstart: AI Agent Processing Pipeline

## Prerequisites

- Python 3.12+
- Next.js development server running (`npm run dev` in web_app/)
- Cloudinary account configured
- Google Gemini API key configured

---

## Setup Python Backend

### 1. Install Dependencies

```bash
cd agent_backend
pip install -r requirements.txt
```

**Required packages** (to be added to requirements.txt):
- fastapi>=0.128.0
- uvicorn>=0.30.0
- langchain-google-genai>=4.2.1
- requests>=2.31.0
- python-multipart>=0.0.9

### 2. Environment Variables

Create `.env` file in agent_backend/:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Backend

```bash
cd agent_backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Setup Frontend

### 1. Add Processing Page

Create `web_app/src/app/processing/page.tsx`:
- Centered box with #212121 background
- bot-animation.mp4 in loop
- Status message display

### 2. Add Animation Asset

Add `bot-animation.mp4` to `web_app/public/` directory

---

## Testing the Integration

1. Start Next.js: `cd web_app && npm run dev`
2. Start Python: `cd agent_backend && uvicorn main:app --port 8000`
3. Upload a video (existing flow)
4. Verify:
   - User redirected to /processing
   - Animation plays
   - Video downloaded from Cloudinary
   - Video uploaded to Gemini Files API
   - Local file cleaned up after completion

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/videos/process` | POST | Process video (download + Gemini upload) |
| `/processing` | GET | Processing status page (frontend) |