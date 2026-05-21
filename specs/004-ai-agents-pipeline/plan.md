# Implementation Plan: AI Agents Pipeline

**Branch**: `004-ai-agents-pipeline` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ai-agents-pipeline/spec.md`

## Summary

Implement two AI agents (Security Check Agent and SEO Generator Agent) in the Python agent backend using LangChain v1.2's `create_agent` and `create_deep_agent` APIs with Google Gemini. The security agent outputs a boolean pass/fail for content violations after analyzing the video with gemini files api. The SEO agent uses Gemini Files API for video analysis, a research tool for niche-specific web research, and a YouTube category resolution tool. Pipeline state persists in MongoDB via Next.js with async polling for progress tracking.

## Technical Context

**Language/Version**: Python ≥3.12 (agent backend), TypeScript 5 (Next.js frontend)
**Primary Dependencies**:

- Agent Backend: LangChain ≥1.2.10, deepagents, langchain-google-genai ≥4.2.1, FastAPI ≥0.128.0, google-genai (Gemini Files API)
- Next.js: Axios for HTTP calls, MongoDB/mongoose for state persistence
  **Storage**: MongoDB (via Next.js) for pipeline state; Gemini Files API for video file references
  **Testing**: N/A (Excluded per Constitution Rule 6)
  **Target Platform**: Linux server (Railway free tier -- 1 vCPU + 0.5 GB RAM + 0.5 GB Volume)
  **Project Type**: Web application (dual-backend: Next.js + Python FastAPI)
  **Performance Goals**: API responses within 10 seconds; async pipeline with polling for long-running AI processing
  **Constraints**:
- Railway free tier limits (0.5 GB RAM, 10-second timeout for synchronous calls)
- Vercel serverless function timeouts
- Gemini Files API: files up to ~2GB for video, 48-hour file retention
- Short Videos under 50MB for high FPS processing; for short-form content (typically <60 seconds)
  **Scale/Scope**: Portfolio project; single-user per video processing; concurrent pipeline executions limited by Railway resources

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack Compliance**:

- [x] Frontend: Next.js, React, Tailwind CSS, TypeScript only
- [x] Backend: Python, FastAPI, LangChain, Google Gemini only
- [x] New dependencies (deepagents, google-genai) are LangChain ecosystem packages aligned with existing stack

**Quality Standards**:

- [ ] Code follows industry best practices and production-grade standards
- [ ] UI is fully responsive and mobile-optimized
- [ ] Performance meets production requirements; no compromises documented
- [ ] SEO optimized for search engine ranking with good Lighthouse scores
- [ ] Code is clean, professional, well-commented, and modular

**Development Practices**:

- [ ] Existing code reused; search conducted before creating new functions
- [ ] DRY principle followed; no duplicate implementations
- [ ] Dependencies are minimal and approved (deepagents adds planning, subagent, filesystem capabilities)
- [ ] Only explicitly requested features implemented; no additional functionality

**Testing Compliance (CRITICAL - Rule 6)**:

- [ ] NO unit tests included
- [ ] NO integration tests included
- [ ] NO E2E tests included
- [ ] NO test files or test directories created
- [ ] All verification will be manual or through other non-automated methods

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-agents-pipeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (repository root)

```text
agent_backend/
├── main.py                          # FastAPI app (existing, new routers added)
├── requirements.txt                 # New: deepagents, google-genai
└── src/
    ├── routes/
    │   ├── video_processing.py      # Existing (extended with pipeline endpoints)
    │   ├── pipeline.py              # NEW: Pipeline orchestration endpoints
    │   └── status.py                # NEW: Polling status endpoint
    ├── agents/
    │   ├── __init__.py
    │   ├── security_agent.py        # NEW: Security check agent using create_agent
    │   └── seo_agent.py             # NEW: SEO generator agent using create_deep_agent
    ├── tools/
    │   ├── __init__.py
    │   ├── research_tool.py         # NEW: Web research tool for SEO agent
    │   ├── category_tool.py         # NEW: YouTube category resolution tool
    │   └── video_analysis_tool.py   # NEW: Gemini Files API video analysis tool
    ├── services/
    │   ├── gemini_upload.py         # Existing (extended for Files API analysis)
    │   └── youtube_api.py           # NEW: YouTube Data API client for categories
    └── utils/
        └── file_manager.py          # Existing (reused)

web_app/
└── src/
    ├── app/
    │   └── api/
    │       └── pipeline/
    │           ├── route.ts         # NEW: Pipeline initiation API route
    │           └── status/
    │               └── [videoId]/
    │                   └── route.ts # NEW: Polling status API route
    ├── lib/
    │   └── pipeline-state.ts        # NEW: MongoDB pipeline state model
    └── components/
        └── pipeline-progress.tsx    # NEW: Progress UI component
```

**Structure Decision**: Dual-backend architecture (existing pattern). New agent modules added to `agent_backend/src/agents/` and `agent_backend/src/tools/`. New Next.js API routes for pipeline orchestration and status polling. MongoDB model for pipeline state persistence in Next.js.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                               | Why Needed                                                                                              | Simpler Alternative Rejected Because                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| deepagents package                      | SEO agent needs planning, research tool delegation, and filesystem capabilities for deep video analysis | Standard `create_agent` would require manually implementing planning, subagent delegation, and context management |
| google-genai package (new genai client) | Required for Gemini Files API video analysis with file ID references                                    | Existing `google-generativeai` package doesn't support the Files API workflow with file ID persistence            |
