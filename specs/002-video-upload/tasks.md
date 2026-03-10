# Tasks: Video Upload with YouTube OAuth & Cloudinary

**Input**: Design documents from `specs/002-video-upload/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests (Constitution Rule 6)**: This project explicitly EXCLUDES all tests—no unit, integration, or E2E tests are permitted under any circumstances. All verification must be done through manual testing or other methods. DO NOT include any test tasks in task lists.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency management

- [ ] T001 Install core dependencies (next-cloudinary, google-auth-library, axios, react-icons) in web_app/package.json
- [ ] T002 [P] Configure Cloudinary environment variables in web_app/.env
- [ ] T003 [P] Configure Google YouTube OAuth environment variables in web_app/.env

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and models required before user stories can be implemented

- [ ] T004 Define Video schema with status enums and validation in web_app/src/models/Video.ts
- [ ] T005 Update User schema to include encrypted youtubeCredentials in web_app/src/models/User.ts
- [ ] T006 [P] Implement Cloudinary client configuration in web_app/src/lib/cloudinary.ts
- [ ] T007 [P] Implement YouTube OAuth utility functions (encryption/decryption) in web_app/src/lib/youtube-oauth.ts
- [ ] T008 [P] Ensure MongoDB connection utility is ready in web_app/src/lib/db.ts

**Checkpoint**: Foundation ready - YouTube OAuth and Video Upload implementation can begin.

---

## Phase 3: User Story 1.5 - YouTube OAuth Verification (Priority: P1) 🎯 MVP Prerequisite

**Goal**: Enable users to authorize GoViral to upload videos to their YouTube channel.

**Independent Test**: Clear youtubeCredentials from a user in DB, click upload, verify redirect to Google consent, grant permission, and verify encrypted tokens are saved in User document.

### Implementation for User Story 1.5

- [ ] T009 [US1.5] Implement YouTube OAuth initiation endpoint in web_app/src/app/api/auth/youtube/route.ts
- [ ] T010 [US1.5] Implement YouTube OAuth callback handler to exchange code for tokens in web_app/src/app/api/auth/youtube/callback/route.ts
- [ ] T011 [US1.5] Implement token refresh logic in web_app/src/lib/youtube-oauth.ts
- [ ] T012 [US1.5] Add YouTube OAuth status check to homepage upload button logic in web_app/src/components/layout/Navbar.tsx or relevant component

**Checkpoint**: YouTube OAuth flow is functional and tokens are securely stored.

---

## Phase 4: User Story 1 - Basic Video Upload Flow (Priority: P1) 🎯 MVP

**Goal**: Allow signed-in users with valid YouTube credentials to upload videos to Cloudinary.

**Independent Test**: Upload a valid MP4 file (<60s, <50MB), verify progress indicator, verify metadata is saved to MongoDB, and verify final success state.

### Implementation for User Story 1

- [ ] T013 [US1] Implement Cloudinary signature endpoint in web_app/src/app/api/cloudinary/sign-cloudinary-params/route.ts
- [ ] T014 [US1] Create VideoUploadWidget component using CldUploadWidget in web_app/src/components/upload/VideoUploadWidget.tsx
- [ ] T015 [US1] Implement video metadata storage endpoint in web_app/src/app/api/videos/route.ts
- [ ] T016 [US1] Create the upload page layout and integration in web_app/src/app/upload/page.tsx
- [ ] T017 [US1] Implement frontend security checks (type, size, duration) in web_app/src/components/upload/VideoUploadWidget.tsx

**Checkpoint**: Core upload flow is functional from UI to Database.

---

## Phase 5: User Story 2 & 3 - Error Handling & Progress (Priority: P1/P2)

**Goal**: Enhance UX with real-time feedback and robust error reporting.

**Independent Test**: Attempt to upload a 70s video, verify "Video duration exceeds limit" error. Interrupt network during upload, verify failure message.

### Implementation for User Story 2 & 3

- [ ] T018 [P] [US3] Implement UploadProgress component for visual feedback in web_app/src/components/upload/UploadProgress.tsx
- [ ] T019 [US2] Add comprehensive error handling UI to the upload widget in web_app/src/components/upload/VideoUploadWidget.tsx
- [ ] T020 [US2] Implement user-friendly error messages for API failures in web_app/src/app/upload/page.tsx
- [ ] T021 [US3] Integrate real-time progress events from Cloudinary into the UI in web_app/src/components/upload/VideoUploadWidget.tsx

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integrations and quality checks.

- [ ] T022 [P] Implement dummy Agent Service notification in web_app/src/app/api/videos/route.ts
- [ ] T023 Ensure mobile-responsive design for the upload interface in web_app/src/app/upload/page.tsx
- [ ] T024 [P] Update README/Documentation with new environment variable requirements
- [ ] T025 Final validation of all states (pending, processing, completed, failed) against data-model.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must be completed first to provide libraries and env configuration.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks all UI and API work.
- **User Story 1.5 (Phase 3)**: Prerequisite for User Story 1 (upload requires auth).
- **User Story 1 (Phase 4)**: Core functionality.
- **Polish (Phase 6)**: Depends on functional upload flow.

### User Story Dependencies

- **US1** depends on **US1.5** (OAuth tokens needed before upload).
- **US2/US3** are enhancements to **US1** but can be developed partially in parallel with UI implementation.

---

## Implementation Strategy

### MVP First (User Story 1 & 1.5)

1. Setup environment and install dependencies.
2. Define MongoDB models for User and Video.
3. Complete YouTube OAuth flow to ensure token availability.
4. Implement the Cloudinary upload widget and metadata storage API.
5. **STOP and VALIDATE**: Perform a manual upload and verify database state.

### Incremental Delivery

1. Foundation + OAuth → Credentials ready.
2. Basic Upload → Video in Cloudinary + DB record created.
3. Progress & Error Handling → Improved UX and resilience.
4. Agent Notification → Pipeline initiation.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label ensures traceability to spec.md.
- Ensure `ENCRYPTION_KEY` is set for token security.
- Agent service notification uses a placeholder URL until Feature 003.
