# Tasks: AI Agent Processing Pipeline

**Feature**: AI Agent Processing Pipeline
**Branch**: `003-ai-agent`
**Input**: Feature specification from `/specs/003-ai-agent/spec.md`

**Testing Policy**: NOT APPLICABLE (Excluded per Constitution Rule 6)

## Phase 1: Setup

**Goal**: Initialize Python backend project with required dependencies

**Independent Test Criteria**: Python backend can start and respond to health check

- [ ] T001 Create agent_backend/ directory structure per implementation plan
- [ ] T002 Create agent_backend/requirements.txt with FastAPI, langchain-google-genai, requests, uvicorn
- [ ] T003 Create agent_backend/.env.example with GEMINI_API_KEY placeholder
- [ ] T004 [P] Create agent_backend/src/__init__.py
- [ ] T005 [P] Create agent_backend/src/routes/__init__.py
- [ ] T006 [P] Create agent_backend/src/services/__init__.py
- [ ] T007 [P] Create agent_backend/src/utils/__init__.py
- [ ] T008 Create agent_backend/main.py with FastAPI app initialization and health endpoint

## Phase 2: Foundational

**Goal**: Create base services and utilities needed for all user stories

**Independent Test Criteria**: Utility modules can be imported and used without errors

- [ ] T009 [P] Create agent_backend/src/utils/file_manager.py for temporary file handling
- [ ] T010 [P] Create agent_backend/src/services/cloudinary_download.py with download function
- [ ] T011 [P] Create agent_backend/src/services/gemini_upload.py with upload function
- [ ] T012 Create agent_backend/src/routes/video_processing.py with POST /process-video endpoint

## Phase 3: User Story 1 - View Processing Status

**Goal**: Display processing page with animation and status message when video is being processed

**Independent Test Criteria**: User can view /processing page with #212121 centered box and looping animation

**Dependencies**: Requires Phase 2 complete

- [ ] T013 [US1] Create web_app/public/bot-animation.mp4 placeholder file
- [ ] T014 [US1] Create web_app/src/app/processing/page.tsx with centered #212121 box
- [ ] T015 [US1] Implement video tag with autoplay and loop for bot-animation.mp4 in src/app/processing/page.tsx
- [ ] T016 [US1] Add generic status text "Processing your video..." display beneath animation in src/app/processing/page.tsx
- [ ] T017 [US1] Ensure responsive design for mobile in src/app/processing/page.tsx
- [ ] T018 [US1] Add video processing call from existing video upload flow to trigger backend

## Phase 4: User Story 2 - Download Video from Cloudinary

**Goal**: Backend downloads video from Cloudinary to local server storage

**Independent Test Criteria**: Video file exists locally after processing request with valid Cloudinary URL

**Dependencies**: Requires Phase 3 (US1) for the trigger, Phase 2 for services

- [ ] T019 [US2] Implement video download logic in src/services/cloudinary_download.py
- [ ] T020 [US2] Add error handling for invalid/missing Cloudinary URLs in src/services/cloudinary_download.py
- [ ] T021 [US2] Add streaming download for memory efficiency in src/services/cloudinary_download.py
- [ ] T022 [US2] Integrate download service in src/routes/video_processing.py

## Phase 5: User Story 3 - Upload Video to Gemini Files API

**Goal**: Upload downloaded video to Google Gemini Files API

**Independent Test Criteria**: Video is uploaded to Gemini and file reference is returned

**Dependencies**: Requires Phase 4 (US2) - download must complete before upload

- [ ] T023 [US3] Implement video upload to Gemini Files API in src/services/gemini_upload.py
- [ ] T024 [US3] Use google.genai.Client with files.upload() per research.md
- [ ] T025 [US3] Handle Gemini API errors and rate limits in src/services/gemini_upload.py
- [ ] T026 [US3] Integrate Gemini upload in src/routes/video_processing.py after download completes
- [ ] T027 [US3] Return Gemini file reference in API response

## Phase 6: User Story 4 - Clean Up Local Video File

**Goal**: Delete temporary local video file after processing completes

**Independent Test Criteria**: Local video file is deleted after processing (success or failure)

**Dependencies**: Requires Phase 5 (US3) - cleanup happens after processing

- [ ] T028 [US4] Implement file cleanup in src/utils/file_manager.py
- [ ] T029 [US4] Add cleanup on success in src/routes/video_processing.py
- [ ] T030 [US4] Add cleanup on failure (error handling) in src/routes/video_processing.py

## Phase 7: Polish & Integration

**Goal**: End-to-end integration and error handling

**Independent Test Criteria**: Complete flow from video upload to Gemini upload with proper cleanup

**Dependencies**: Requires all user stories complete

- [ ] T031 [P] Add proper error responses in src/routes/video_processing.py for all failure cases
- [ ] T032 [P] Add client-side redirect logic in Next.js after receiving processing-started response
- [ ] T033 [P] Update video upload API to call Python backend after Cloudinary upload succeeds
- [ ] T034 Ensure Railway deployment configuration is valid (uvicorn startup command)

---

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓        ↓
Phase 3  Phase 4
 (US1)    (US2)
    ↓        ↓
    └────┬───┘
         ↓
    Phase 5
    (US3)
         ↓
    Phase 6
    (US4)
         ↓
    Phase 7
    (Polish)
```

**Story Completion Order**:
- US1 (Processing Page) can start after Phase 2
- US2 (Cloudinary Download) requires Phase 2
- US3 (Gemini Upload) requires US2 to complete first (sequential pipeline)
- US4 (Cleanup) requires US3 to complete first (cleanup after processing)

## Parallel Execution Opportunities

- **T004-T007**: Create multiple __init__.py files in parallel
- **T009-T011**: Create service modules in parallel (no interdependencies)
- **T013-T017**: Frontend tasks within US1 are sequential but can be tested together
- **T019-T022**: US2 tasks sequential (must wait for download service implementation)
- **T023-T027**: US3 tasks sequential (must wait for upload service)
- **T028-T030**: US4 tasks sequential but can follow parallel with Phase 7 tasks
- **T031-T034**: Polish tasks can run in parallel with each other

## Implementation Strategy

**MVP Scope** (User Story 1 only):
- Create /processing page with animation
- User redirected to page when processing starts

**Incremental Delivery**:
1. First deliver: Phase 1 + Phase 2 + Phase 3 (basic processing page)
2. Second deliver: Phase 4 (Cloudinary download)
3. Third deliver: Phase 5 (Gemini upload)
4. Fourth deliver: Phase 6 (cleanup)
5. Fifth deliver: Phase 7 (polish and integration)

## Total Task Count

- Phase 1: 8 tasks
- Phase 2: 4 tasks
- Phase 3 (US1): 6 tasks
- Phase 4 (US2): 4 tasks
- Phase 5 (US3): 5 tasks
- Phase 6 (US4): 3 tasks
- Phase 7: 4 tasks

**Total: 34 tasks**

- User Story 1: 6 tasks
- User Story 2: 4 tasks
- User Story 3: 5 tasks
- User Story 4: 3 tasks

**Parallelizable Tasks**: 16 tasks marked with [P]