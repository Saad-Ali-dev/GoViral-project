# Feature Specification: Video Upload Feature

**Feature Branch**: `002-video-upload`  
**Created**: 2026-03-09  
**Updated**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "video-upload-feature - Workflow (File Upload Feature) When a User clicks on the upload button on the homepage, If the User is signed-in take him to /upload page, then take the video file from User, run Security checks on the frontend, if ok upload to cloudinary, else show error with cause to User UI. When it is uploading show the progress to User, when upload complete get metadata (cloudinary_url, video_size, duration etc) and send to backend and store in db and update UI and also send that data to agent service so that the agent loop execution could begin. if any error occurs during the process, show it with cause to User."

⚠️ **YOUTUBE FEATURES REMOVED** — YouTube OAuth, channel access, YouTube upload, YouTube connection checks, and YouTube Data API integration have been permanently removed from this project. This file is preserved for historical reference only.

## Clarifications

### Session 2026-03-09

- Q: What specific security checks should run on video files before upload? → A: File should be a video file type and it should be less than <60s duration and size should be less than <50 MB.
- Q: How should video uploads be uniquely identified in the system? → A: Each video is identified and linked to the user which uploads it by connecting the user clerkid with video that is being uploaded. UUID may also be used if needed.
- Q: What are the possible lifecycle states for a video upload? → A: Defined in Video.ts: pending, processing, completed, failed, published
REMOVED: YouTube feature
- Q: When should YouTube OAuth verification occur? → ...
- Q: What YouTube OAuth scopes are required? → ...
- Q: How should YouTube credentials be stored? → ...
- Q: What happens if YouTube OAuth flow fails or is cancelled? → ...

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Video Upload Flow (Priority: P1)

A signed-in user clicks the upload button on the homepage, selects a video file, sees upload progress, and the system initiates agent processing after successful upload.

**Why this priority**: This is the core functionality that delivers the primary value of the feature - enabling users to upload videos and trigger AI agent processing.

**Independent Test**: Can be fully tested by performing a complete video upload from homepage click to seeing agent processing initiation, and delivers the ability to upload videos for SEO optimization.

**Acceptance Scenarios**:

1.  **Given** a user is signed-in and on the homepage, **When** the user clicks the upload button, **Then** the user is redirected to the /upload page.
2.  **Given** a user is on the /upload page, **When** the user selects a video file, **Then** pre-upload security checks (file format/type and size < 50MB) run on the frontend.
3.  **Given** pre-upload checks pass, **When** the upload to Cloudinary begins, **Then** the user sees an upload progress indicator.
4.  **Given** the upload completes successfully, **When** the system retrieves metadata from Cloudinary, **Then** a post-upload security check runs to verify video duration is < 60 seconds.
5.  **Given** all security checks pass, **When** the system has all metadata, **Then** the metadata is sent to the backend and stored in the database.
6.  **Given** metadata is stored, **When** the backend processes the data, **Then** the UI updates to show success and the agent service is notified to begin the agent loop execution.
7.  **Given** a user is not signed-in, **When** the user clicks the upload button on the homepage, **Then** the user is redirected to the sign-in page.

---

REMOVED: YouTube feature
### User Story 1.5 - YouTube OAuth Verification during Upload (Priority: P1)

---



REMOVED: YouTube feature
### User Story 1.6 - Dedicated YouTube Connection (Priority: P2)

---

### User Story 2 - Error Handling During Upload (Priority: P1)

When errors occur during any step of the upload process, the system shows clear error messages with specific causes to help users understand and resolve issues.

**Why this priority**: Error handling is critical for user experience - unclear errors lead to frustration and task abandonment.

**Independent Test**: Can be tested by deliberately triggering errors (e.g., selecting invalid file type, network interruption during upload) and verifying appropriate error messages are shown.

**Acceptance Scenarios**:

1.  **Given** a user selects an unsupported video file format, **When** pre-upload security checks run, **Then** the system shows the error message: "Unsupported file format. Please upload MP4, MOV, or AVI files."
2.  **Given** a user selects a video file exceeding the size limit, **When** pre-upload security checks run, **Then** the system shows the error message: "File size exceeds the 50MB limit."
3.  **Given** an uploaded video's duration exceeds the limit (over 60 seconds), **When** the post-upload security check runs, **Then** the system shows the error message: "Video duration exceeds the 60-second limit." and the upload is marked as failed.
4.  **Given** the network connection fails during upload, **When** the upload cannot complete, **Then** the system shows the error message: "Upload failed due to network issues. Please try again."
5.  **Given** the backend cannot store metadata, **When** it processes the upload data, **Then** the system shows the error message: "A server error occurred while saving the video. Please try again."

---

### User Story 3 - Upload Progress and Completion Feedback (Priority: P2)

Users receive clear feedback about upload status and completion, including progress indication and confirmation of successful processing.

**Why this priority**: Progress feedback reduces user anxiety during waiting periods and confirms successful completion.

**Independent Test**: Can be tested by uploading a video and observing progress updates and final confirmation.

**Acceptance Scenarios**:

1.  **Given** an upload has started, **When** the upload is in progress, **Then** the user sees a progress bar or percentage indicator.
2.  **Given** the upload completes successfully and all checks pass, **When** metadata is processed, **Then** the user sees a confirmation message: "Video uploaded successfully. Agent processing has started."
3.  **Given** a user navigates away from the /upload page during an upload, **When** the upload is in progress, **Then** the upload process is cancelled and does not persist.

---

### Edge Cases

- **What happens when multiple users upload simultaneously?**: System should handle concurrent uploads without data corruption or performance degradation.
- **How does system handle very large video files?**: System enforces a 50MB file size limit pre-upload.
- **How does system handle very long video files?**: System enforces a 60-second duration limit post-upload.
- **What if Cloudinary service is unavailable?**: System should show an appropriate error message and suggest trying again later.
- **What if agent service is unavailable when metadata is sent?**: System should retry or queue the request and notify the user of a delay.
REMOVED: YouTube feature
- **What if YouTube OAuth token expires during upload?**: ...
- **What if user revokes YouTube permissions after initial authorization?**: ...

## Requirements _(mandatory)_

### Functional Requirements

**Testing Policy (Constitution Rule 6)**: This project does NOT include unit, integration, or E2E tests. All acceptance criteria MUST be verified through manual testing or other non-automated methods.

- **FR-001**: System MUST redirect signed-in users to the /upload page when they click the upload button on the homepage.
- **FR-002**: System MUST run pre-upload security checks on selected video files for file type and size (< 50MB).
- **FR-003**: System MUST run a post-upload check to validate video duration is less than 60 seconds.
- **FR-004**: System MUST only process files that pass all security checks; files failing checks must result in clear error messages.
- **FR-005**: System MUST display an upload progress indicator during the file upload to Cloudinary.
- **FR-006**: System MUST retrieve metadata (cloudinary_url, video_size, duration) after a successful upload.
- **FR-007**: System MUST send metadata to the backend to be stored in the database.
- **FR-008**: System MUST update the UI to show upload completion and success status.
- **FR-009**: System MUST send upload data to the AI agent service (just a placeholder/dummy now but will be implemented in future feature) to initiate its execution loop.
- **FR-010**: System MUST NOT implement upload state persistence. If a user navigates away from the page during an upload, the upload is cancelled.
REMOVED: YouTube feature
- **FR-011**: System MUST verify that a valid YouTube access token exists in the user's MongoDB document before performing an action that requires YouTube permissions.
- **FR-012**: System MUST trigger the YouTube OAuth flow if a valid access token is missing when required.
- **FR-013**: System MUST store the YouTube access token, refresh token, and expiry timestamp encrypted at rest in the User document.
- **FR-014**: System MUST automatically refresh expired access tokens using the stored refresh token.
- **FR-015**: System MUST abort the current process and show an error if the user cancels or denies YouTube OAuth consent.
- **FR-016**: System MUST redirect the user back to their original flow (e.g., /upload page) after successful YouTube OAuth completion.
- **FR-017**: System MUST provide a 'Connect YouTube' button in the Navbar/Sidebar for users who have not yet connected their account.

### Non-Functional Requirements

- **NFR-001 (Performance)**: The application must be fully performant and achieve high Lighthouse scores for performance, accessibility, and best practices, in accordance with the project constitution. Load times for the `/upload` page and UI feedback should be near-instantaneous.
- **NFR-002 (SEO)**: The `/upload` page and all related public-facing pages must be fully SEO-optimized. This includes generating appropriate and dynamic metadata (title, description), using semantic HTML, and ensuring the page is crawlable by search engines.

_Assumptions_:

- Pre-upload security checks include file type validation (e.g., MP4, MOV) and size validation (< 50MB).
- Post-upload security checks include duration validation (< 60 seconds), performed after receiving the file analysis from Cloudinary.
- Cloudinary is the designated third-party service for video storage and metadata extraction.
- The AI Agent Service is a future feature. For now, the Next.js backend will send the required data to a made-up/mock URL endpoint, and the request should be considered successful if it is sent without error.
REMOVED: YouTube feature
- YouTube OAuth uses Google's OAuth 2.0 flow with the authorization code grant type.

### Key Entities _(include if feature involves data)_

- **VideoUpload**: Represents a video upload attempt, uniquely identified (e.g., UUID) and linked to the uploading user via Clerk ID, containing metadata such as cloudinary_url, file_size, duration, status (pending, processing, completed, failed, published), and error messages.
- **User**: Represents the authenticated user initiating the upload, identified by Clerk ID (relationship: one user can have multiple video uploads).
- **VideoMetadata**: Contains the cloudinary_url, video_size, duration, and other technical details extracted after upload.
REMOVED: YouTube feature
- **YouTubeCredentials**: Embedded document in User containing youtubeAccessToken (encrypted), youtubeRefreshToken (encrypted), youtubeTokenExpiry (timestamp), and youtubeChannelId for OAuth authentication with YouTube API.

## Success Criteria _(mandatory)_

- All functionality should work as described in the acceptance scenarios without any critical bugs or issues.
- Users can successfully upload valid video files and see progress and completion feedback.
- The entire feature is performant and SEO-optimized as per the non-functional requirements.
REMOVED: YouTube feature
- The YouTube connection flow can be initiated both from the upload process and a dedicated UI button.
