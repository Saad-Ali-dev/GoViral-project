# Tasks: Video Upload Feature

**Input**: Design documents from `/specs/002-video-upload/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests (Constitution Rule 6)**: This project explicitly EXCLUDES all tests—no unit, integration, or E2E tests are permitted under any circumstances. All verification must be done through manual testing or other methods. DO NOT include any test tasks in task lists.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US1.5, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All paths relative to `web_app/` directory
- Next.js App Router structure with `src/app/`, `src/components/`, `src/lib/`, `src/models/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install next-cloudinary and google-auth-library dependencies in web_app/
- [ ] T002 [P] Verify environment variables in web_app/.env.local (Cloudinary, YouTube OAuth, MongoDB)
- [ ] T003 [P] Review existing project structure and Clerk authentication setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Create Cloudinary configuration utility in web_app/src/lib/cloudinary.ts
- [ ] T005 [P] Create YouTube OAuth utilities in web_app/src/lib/youtube-oauth.ts (encrypt/decrypt, token validation)
- [ ] T006 [P] Extend User model with YouTube credentials in web_app/src/models/User.ts
- [ ] T007 [P] Create VideoUpload model in web_app/src/models/Video.ts
- [ ] T008 [P] Verify MongoDB connection utility in web_app/src/lib/db.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Video Upload Flow (Priority: P1) 🎯 MVP

**Goal**: Enable signed-in users to upload short-form videos (<60s, <50MB) to Cloudinary with real-time progress feedback, metadata storage, and agent service notification.

**Independent Test**: Can be fully tested by performing a complete video upload from homepage click to seeing agent processing initiation, and delivers the ability to upload videos for SEO optimization.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create Cloudinary signing API route in web_app/src/app/api/cloudinary/sign-cloudinary-params/route.ts
- [ ] T010 [P] [US1] Create video metadata storage API route in web_app/src/app/api/videos/route.ts (POST for storage, GET for retrieval)
- [ ] T011 [P] [US1] Create single video retrieval API route in web_app/src/app/api/videos/[id]/route.ts
- [ ] T012 [US1] Create UploadProgress component in web_app/src/components/upload/UploadProgress.tsx
- [ ] T013 [US1] Create VideoUploadWidget component in web_app/src/components/upload/VideoUploadWidget.tsx
- [ ] T014 [US1] Create /upload page with SEO metadata in web_app/src/app/upload/page.tsx
- [ ] T015 [US1] Update homepage upload button to redirect signed-in users to /upload in web_app/src/app/page.tsx
- [ ] T016 [US1] Add comprehensive error handling for file type, size, and duration validation
- [ ] T017 [US1] Add logging for upload operations and agent service notification

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can upload videos and see progress/completion feedback

---

## Phase 4: User Story 1.5 - YouTube OAuth Verification during Upload (Priority: P1)

**Goal**: Automatically verify YouTube OAuth credentials when user initiates upload and trigger OAuth flow if credentials are missing or expired.

**Independent Test**: Can be fully tested by clearing YouTube credentials from a user's document and initiating an upload, verifying the OAuth flow triggers and credentials are stored upon completion.

### Implementation for User Story 1.5

- [ ] T018 [P] [US1.5] Create YouTube OAuth initiation API route in web_app/src/app/api/auth/youtube/route.ts
- [ ] T019 [P] [US1.5] Create YouTube OAuth callback API route in web_app/src/app/api/auth/youtube/callback/route.ts
- [ ] T020 [US1.5] Add YouTube credential check logic to upload flow in web_app/src/app/upload/page.tsx
- [ ] T021 [US1.5] Implement automatic token refresh logic in web_app/src/lib/youtube-oauth.ts
- [ ] T022 [US1.5] Add OAuth error handling and user messaging for denied/failed authorization

**Checkpoint**: At this point, User Story 1.5 should be fully functional - users without YouTube credentials are automatically redirected to OAuth flow before upload

---

## Phase 5: User Story 1.6 - Dedicated YouTube Connection (Priority: P2)

**Goal**: Provide a dedicated 'Connect YouTube' button in Navbar/Sidebar for users to proactively connect their YouTube account without starting an upload.

**Independent Test**: Can be tested by a signed-in user clicking the 'Connect YouTube' button and completing the OAuth flow, then verifying the credentials are stored and button state changes.

### Implementation for User Story 1.6

- [ ] T023 [P] [US1.6] Create YouTube connection status check API route in web_app/src/app/api/user/youtube-status/route.ts
- [ ] T024 [P] [US1.6] Create ConnectYouTubeButton component in web_app/src/components/layout/ConnectYouTubeButton.tsx
- [ ] T025 [US1.6] Integrate ConnectYouTubeButton into Navbar/Sidebar in web_app/src/components/layout/Navbar.tsx (or equivalent layout component)
- [ ] T026 [US1.6] Add conditional rendering logic for connected/disconnected states

**Checkpoint**: At this point, User Story 1.6 should be fully functional - users can connect YouTube account independently from upload flow

---

## Phase 6: User Story 2 - Error Handling During Upload (Priority: P1)

**Goal**: Display clear, actionable error messages for all upload failure scenarios (invalid file type, size exceeded, duration exceeded, network issues, server errors).

**Independent Test**: Can be tested by deliberately triggering errors (selecting invalid file type, oversized file, long video, network interruption) and verifying appropriate error messages are shown.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create error message constants/utilities in web_app/src/lib/error-messages.ts
- [ ] T028 [US2] Add pre-upload validation error display in VideoUploadWidget component
- [ ] T029 [US2] Add post-upload validation error handling in /upload page
- [ ] T030 [US2] Add network error handling and retry messaging in /upload page
- [ ] T031 [US2] Add server error handling with user-friendly messages in API routes
- [ ] T032 [US2] Style error states and messages with appropriate visual feedback (red backgrounds, icons)

**Checkpoint**: At this point, User Story 2 should be fully functional - all error scenarios display clear, actionable messages to users

---

## Phase 7: User Story 3 - Upload Progress and Completion Feedback (Priority: P2)

**Goal**: Provide real-time upload progress indication and clear completion confirmation with success messaging.

**Independent Test**: Can be tested by uploading a video and observing progress updates during upload and final confirmation message after successful processing.

### Implementation for User Story 3

- [ ] T033 [P] [US3] Enhance UploadProgress component with percentage display and visual progress bar
- [ ] T034 [US3] Add real-time progress callback integration in VideoUploadWidget
- [ ] T035 [US3] Add success state UI with confirmation message in /upload page
- [ ] T036 [US3] Add "Go to Dashboard" or navigation button after successful upload
- [ ] T037 [US3] Style loading states, disabled states, and transitions for better UX
- [ ] T038 [US3] Add video requirements guidelines section in /upload page

**Checkpoint**: At this point, User Story 3 should be fully functional - users see real-time progress and clear success confirmation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T039 [P] Verify SEO optimization on /upload page (metadata, Open Graph, Twitter Cards)
- [ ] T040 [P] Test mobile responsiveness of upload widget and progress UI
- [ ] T041 [P] Verify accessibility (keyboard navigation, screen reader support, color contrast)
- [ ] T042 [P] Add performance optimizations (lazy loading, image optimization, minimal bundle size)
- [ ] T043 [P] Code cleanup and refactoring across all components
- [ ] T044 [P] Update documentation in web_app/README.md with feature overview
- [ ] T045 [P] Run quickstart.md validation checklist
- [ ] T046 [P] Verify Lighthouse scores meet performance targets (>90 for performance/accessibility/best practices)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1.5 → P2 → P3)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1.5 (P1)**: Can start after Foundational (Phase 2) - Independent but enhances US1 flow
- **User Story 1.6 (P2)**: Can start after Foundational (Phase 2) - Independent of upload flow
- **User Story 2 (P1)**: Can start after US1 basic implementation - Integrates with all upload tasks
- **User Story 3 (P2)**: Can start after US1 basic implementation - Enhances progress/completion UI

### Within Each User Story

- API routes before components (backend before frontend)
- Models/utilities before API routes
- Core implementation before error handling
- Core implementation before UI polish

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003 can run in parallel with T001
- **Phase 2 (Foundational)**: T004, T005, T006, T007, T008 can ALL run in parallel (different files)
- **Phase 3 (US1)**: T009, T010, T011 can run in parallel; T012, T013 can run in parallel
- **Phase 4 (US1.5)**: T018, T019 can run in parallel
- **Phase 5 (US1.6)**: T023, T024 can run in parallel
- **Phase 6 (US2)**: T027 can run in parallel with other US2 tasks
- **Phase 7 (US3)**: T033 can run in parallel with other US3 tasks
- **Phase 8 (Polish)**: ALL tasks can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together (different files, no dependencies):
Task: "Create Cloudinary configuration utility in web_app/src/lib/cloudinary.ts"
Task: "Create YouTube OAuth utilities in web_app/src/lib/youtube-oauth.ts"
Task: "Extend User model with YouTube credentials in web_app/src/models/User.ts"
Task: "Create VideoUpload model in web_app/src/models/Video.ts"
Task: "Verify MongoDB connection utility in web_app/src/lib/db.ts"
```

---

## Parallel Example: User Story 1

```bash
# Launch API routes in parallel:
Task: "Create Cloudinary signing API route in web_app/src/app/api/cloudinary/sign-cloudinary-params/route.ts"
Task: "Create video metadata storage API route in web_app/src/app/api/videos/route.ts"
Task: "Create single video retrieval API route in web_app/src/app/api/videos/[id]/route.ts"

# Launch components in parallel (after API routes):
Task: "Create UploadProgress component in web_app/src/components/upload/UploadProgress.tsx"
Task: "Create VideoUploadWidget component in web_app/src/components/upload/VideoUploadWidget.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (basic upload without OAuth check)
4. **STOP and VALIDATE**: Test basic upload flow manually
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (basic upload) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 1.5 (OAuth verification) → Test independently → Deploy/Demo
4. Add User Story 1.6 (Connect YouTube button) → Test independently → Deploy/Demo
5. Add User Story 2 (error handling) → Test independently → Deploy/Demo
6. Add User Story 3 (progress/completion UI polish) → Test independently → Deploy/Demo
7. Complete Phase 8 (Polish) → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (API routes + basic components)
   - Developer B: User Story 1.5 (OAuth routes + integration)
   - Developer C: User Story 1.6 (Connect button + status API)
3. After US1/1.5/1.6 complete:
   - Developer A: User Story 2 (error handling)
   - Developer B: User Story 3 (progress/completion UI)
4. Team completes Phase 8 (Polish) together

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 3 tasks |
| Phase 2 | Foundational | 5 tasks |
| Phase 3 | User Story 1 (Basic Upload) | 9 tasks |
| Phase 4 | User Story 1.5 (OAuth Verification) | 5 tasks |
| Phase 5 | User Story 1.6 (Connect YouTube Button) | 4 tasks |
| Phase 6 | User Story 2 (Error Handling) | 6 tasks |
| Phase 7 | User Story 3 (Progress & Completion) | 6 tasks |
| Phase 8 | Polish & Cross-Cutting | 8 tasks |
| **Total** | | **46 tasks** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently (manual testing only - NO automated tests per Constitution Rule 6)
- All verification must be done through manual testing or other non-automated methods
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
