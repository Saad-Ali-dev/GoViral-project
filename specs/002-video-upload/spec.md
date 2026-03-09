# Feature Specification: Video Upload Feature

**Feature Branch**: `002-video-upload`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "video-upload-feature - Workflow (File Upload Feature) When a User clicks on the upload button on the homepage, If the User is signed-in take him to /upload page, then take the video file from User, run Security checks on the frontend, if ok upload to cloudinary, else show error with cause to User UI. When it is uploading show the progress to User, when upload complete get metadata (cloudinary_url, video_size, duration etc) and send to backend and store in db and update UI and also send that data to agent service so that the agent loop execution could begin. if any error occurs during the process, show it with cause to User."

## Clarifications

### Session 2026-03-09

- Q: What specific security checks should run on video files before upload? → A: File should be a video file type and it should be less than <60s duration and size should be less than <50 MB.
- Q: How should video uploads be uniquely identified in the system? → A: Each video is identified and linked to the user which uploads it by connecting the user clerkid with video that is being uploaded. UUID may also be used if needed.
- Q: What are the possible lifecycle states for a video upload? → A: Defined in Video.ts: pending, processing, completed, failed, published

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Video Upload Flow (Priority: P1)

A signed-in user clicks the upload button on the homepage, selects a video file, sees upload progress, and the system initiates agent processing after successful upload.

**Why this priority**: This is the core functionality that delivers the primary value of the feature - enabling users to upload videos and trigger AI agent processing.

**Independent Test**: Can be fully tested by performing a complete video upload from homepage click to seeing agent processing initiation, and delivers the ability to upload videos for SEO optimization.

**Acceptance Scenarios**:

1. **Given** user is signed-in and on homepage, **When** user clicks the upload button, **Then** user is redirected to /upload page.
2. **Given** user is on /upload page, **When** user selects a valid video file **Then** security checks run (e.g., MP4, MOV, under 60 seconds and under 50MB) on the frontend before upload and proceed to upload if checks pass.
3. **Given** security checks pass, **When** upload begins, **Then** user sees upload progress indicator.
4. **Given** upload completes successfully, **When** system retrieves metadata (cloudinary_url, video_size, duration), **Then** metadata is sent to backend and stored in database.
5. **Given** metadata is stored, **When** backend processes the data, **Then** UI updates to show success and agent service is notified to begin agent loop execution and the data is provided to it.
6. **Given** a user is not signed-in, **When** user clicks the upload button on the homepage, **Then** user is redirected to the sign-in page.

---

### User Story 2 - Error Handling During Upload (Priority: P1)

When errors occur during any step of the upload process, the system shows clear error messages with specific causes to help users understand and resolve issues.

**Why this priority**: Error handling is critical for user experience - unclear errors lead to frustration and task abandonment.

**Independent Test**: Can be tested by deliberately triggering errors (e.g., selecting invalid file type, network interruption during upload) and verifying appropriate error messages are shown.

**Acceptance Scenarios**:

1. **Given** user selects an unsupported video file format, **When** security checks run, **Then** system shows error message: "Unsupported file format. Please upload MP4, MOV, or AVI files."
2. **Given** user selects a video file exceeding size limit, **When** security checks run, **Then** system shows error message: "File size exceeds limit. Maximum size is 50MB."
3. **Given** user selects a video file exceeding duration limit (over 60 seconds), **When** security checks run, **Then** system shows error message: "Video duration exceeds limit. Maximum duration is 60 seconds."
4. **Given** upload starts but network connection fails, **When** upload cannot complete, **Then** system shows error message: "Upload failed due to network issues. Please try again."
5. **Given** backend cannot store metadata, **When** backend processes upload data, **Then** system shows error message: "Unable to save video metadata. Please try again."

---

### User Story 3 - Upload Progress and Completion Feedback (Priority: P2)

Users receive clear feedback about upload status and completion, including progress indication and confirmation of successful processing.

**Why this priority**: Progress feedback reduces user anxiety during waiting periods and confirms successful completion.

**Independent Test**: Can be tested by uploading a video and observing progress updates and final confirmation.

**Acceptance Scenarios**:

1. **Given** upload has started, **When** upload is in progress, **Then** user sees a progress bar or percentage indicator showing upload completion.
2. **Given** upload completes successfully, **When** metadata is processed, **Then** user sees confirmation message: "Video uploaded successfully. Agent processing has started."
3. **Given** user navigates away during upload, **When** they return to the page, **Then** upload progress is preserved or appropriate status is shown.

---

### Edge Cases

- **What happens when multiple users upload simultaneously?**: System should handle concurrent uploads without data corruption or performance degradation.
- **How does system handle very large video files?**: System should have reasonable file size limits and provide clear error messages if limits are exceeded.
- **How does system handle very long video files?**: System should have reasonable duration limits (max 60 seconds) and provide clear error messages if limits are exceeded.
- **What if Cloudinary service is unavailable?**: System should show appropriate error message and suggest trying again later.
- **What if agent service is unavailable when metadata is sent?**: System should retry or queue the request and notify user of delay.

## Requirements _(mandatory)_

### Functional Requirements

**Testing Policy (Constitution Rule 6)**: This project does NOT include unit, integration, or E2E tests. All acceptance criteria MUST be verified through manual testing or other non-automated methods.

- **FR-001**: System MUST redirect signed-in users to /upload page when they click the upload button on the homepage.
- **FR-002**: System MUST run security checks on selected video files before upload, validating file type, size, and duration (max 60 seconds).
- **FR-003**: System MUST only upload files that pass security checks; files failing checks must show clear error messages.
- **FR-004**: System MUST display upload progress indicator during file upload to Cloudinary.
- **FR-005**: System MUST retrieve metadata (cloudinary_url, video_size, duration) after successful upload.
- **FR-006**: System MUST send metadata to backend and store it in database.
- **FR-007**: System MUST update UI to show upload completion and success status.
- **FR-008**: System MUST send upload data to agent service to initiate agent loop execution (For now send the data to dummy or made-up URL because the actual agent service URL is not available and the whole agent service will be implemented in later feature).
- **FR-009**: System MUST show error messages with specific causes for any failures during the upload process.
- **FR-010**: System MUST preserve upload progress state if user navigates away and returns.

_Assumptions_:

- Security checks include file type validation (MP4, MOV, AVI), size validation (max 50MB), and duration validation (max 60 seconds).
- Cloudinary is the designated third-party service for video storage.
- Agent service is a separate microservice that processes videos for SEO optimization.
- Error messages should be user-friendly and indicate the specific issue and possible resolution.

### Key Entities _(include if feature involves data)_

- **VideoUpload**: Represents a video upload attempt, uniquely identified (e.g., UUID) and linked to the uploading user via Clerk ID, containing metadata such as cloudinary_url, file_size, duration, status (pending, processing, completed, failed, published), and error messages.
- **User**: Represents the authenticated user initiating the upload, identified by Clerk ID (relationship: one user can have multiple video uploads).
- **VideoMetadata**: Contains the cloudinary_url, video_size, duration, and other technical details extracted after upload.

## Success Criteria _(mandatory)_

- All functionality should work as described in the acceptance scenarios without any critical bugs or issues.
- Users can successfully upload valid video files and see progress and completion feedback.
