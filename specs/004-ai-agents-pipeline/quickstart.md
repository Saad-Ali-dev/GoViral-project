# Quickstart: AI Agents Pipeline

## Prerequisites

- Python ≥3.12 installed
- Node.js and npm installed
- MongoDB running (for Next.js)
- API keys: `GEMINI_API_KEY`, `YOUTUBE_API_KEY`

## Setup Agent Backend

1. Navigate to `agent_backend/`:
   ```bash
   cd agent_backend
   ```

2. Install new dependencies:
   ```bash
   pip install -U langchain deepagents google-genai
   ```

3. Set environment variables:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   export YOUTUBE_API_KEY="your-youtube-data-api-key"
   ```

4. Start the agent backend:
   ```bash
   python main.py
   ```

## Setup Next.js Frontend

1. Navigate to `web_app/`:
   ```bash
   cd web_app
   ```

2. Install dependencies (if new packages added):
   ```bash
   npm install
   ```

3. Set environment variables (in `.env.local`):
   ```
   AGENT_BACKEND_URL=http://localhost:8000
   ```

4. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

## Testing the Pipeline

1. Upload a video through the UI
2. Navigate to the video processing page
3. Click "Generate SEO Metadata" to start the pipeline
4. Observe progress updates (polling every 2-3 seconds)
5. Review and edit the generated SEO metadata
6. If security check fails, the video is blocked with a notification

## Key Files

- `agent_backend/src/agents/security_agent.py` — Security check agent
- `agent_backend/src/agents/seo_agent.py` — SEO generator agent
- `agent_backend/src/tools/research_tool.py` — Web research tool
- `agent_backend/src/tools/category_tool.py` — YouTube category resolution
- `agent_backend/src/routes/pipeline.py` — Pipeline orchestration endpoints
- `web_app/src/app/api/pipeline/route.ts` — Next.js pipeline API route
- `web_app/src/lib/pipeline-state.ts` — MongoDB pipeline state model
