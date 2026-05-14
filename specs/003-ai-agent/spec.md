# Feature Specification: AI Agent Processing Pipeline

**Feature Branch**: `003-ai-agent`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "The Frontend: A huge box with color #212121 is shown centered on screen and in the box center bot-animation.mp4 file is playing with the respective text beneath about the current operation being carried out to keep the UI and User updated. The Backend: The python backend takes all video data from Next.js and downloads the video from Cloudinary according to the url and keeps the video on local python server as long as it is processing after the whole completion of AI Agents pipeline (which will be implemented in future feature) it removes the video from server. As soon as the download begins the system should redirect the user to /processing page. After the video is downloaded from cloudinary the system should upload the video file to Google Gemini files API."

## Clarifications

### Session 2026-05-15

- Q: How should the user be redirected to /processing page when the backend initiates processing? → A: Next.js receives processing-start response from Python backend and performs client-side redirect using window.location.
- Q: How should the frontend get status updates about the processing progress? → A: Initial state only - Frontend shows processing page with generic message; backend returns final result when complete. Real-time status updates can be added as future enhancement.
- Q: What video format should the processing page animation use? → A: .mp4 format - widely supported across all modern browsers
- Q: How can we maintain state/progress if user moves away from /processing page? → A: Recommended approach: Backend returns a job_id in the response. Frontend stores this ID (URL param or localStorage). User can return to /processing?job_id={id} to see result. For real-time progress (future): Add polling endpoint GET /process-status/{job_id} that returns current stage. Note: Python backend cannot access MongoDB directly per Constitution - status must be stored via Next.js API calls or in-memory on Python side during active request.

## User Scenarios & Testing

### User Story 1 - View Processing Status (Priority: P1)

User wants to see the current status of their video processing with visual feedback.

**Why this priority**: Users need to know their video is being processed and what operation is happening.

**Independent Test**: Can be tested by initiating video processing and verifying the processing page displays correctly with animation and status text.

**Acceptance Scenarios**:

1. **Given** user has submitted a video for processing, **When** processing begins after user selected video file is uploaded to Cloudinary and the data about video is recieved and stored in database and sent to python backend, **Then** user is redirected to /processing page and sees a dark (#212121) centered box with video animation playing and status text displayed
2. **Given** user is on /processing page, **When** system performs different operations, **Then** status text displays generic "Processing your video..." message until complete
3. **Given** user is on /processing page, **When** page loads, **Then** bot-animation.mp4 plays automatically in loop

---

### User Story 2 - Download Video from Cloudinary (Priority: P1)

System downloads the video file from Cloudinary for local processing.

**Why this priority**: The AI agent pipeline requires the video to be available locally.

**Independent Test**: Can be verified by sending a video URL to backend and confirming the video file exists locally during processing.

**Acceptance Scenarios**:

1. **Given** backend receives video data including Cloudinary URL, **When** request is received, **Then** system begins downloading the video file
2. **Given** backend has started downloading, **When** download completes successfully, **Then** video file exists in local server storage
3. **Given** backend is downloading, **When** download fails, **Then** error is returned to frontend with appropriate message

---

### User Story 3 - Upload Video to Gemini Files API (Priority: P1)

System uploads downloaded video to Google Gemini for AI processing.

**Why this priority**: The AI agents need to analyze the video through Google's Gemini API.

**Independent Test**: Can be verified by checking that video is successfully uploaded to Gemini and file reference is available for AI analysis.

**Acceptance Scenarios**:

1. **Given** video is downloaded locally, **When** download completes, **Then** system uploads video to Gemini files API
2. **Given** video upload to Gemini succeeds, **Then** file reference/ID is stored for subsequent AI processing
3. **Given** video upload to Gemini fails, **Then** error is returned and local video file is cleaned up

---

### User Story 4 - Clean Up Local Video File (Priority: P2)

System removes local video file after processing pipeline completes.

**Why this priority**: Prevents disk space accumulation and follows security best practices.

**Independent Test**: Can be verified by checking local file system after processing completes.

**Acceptance Scenarios**:

1. **Given** AI processing pipeline completes (including future Gemini analysis), **When** final operation finishes, **Then** local video file is deleted from server
2. **Given** processing fails at any stage, **When** failure occurs, **Then** local video file is deleted to prevent orphaned files

---

### Edge Cases

- What happens when Cloudinary URL is invalid or video no longer exists?
- How does system handle slow/unstable network connections during download?
- What happens when Gemini API rate limit is reached?
- How does system handle very large video files that exceed memory limits?
- What happens if user navigates away from /processing page before completion? → **ADDRESSED**: Backend returns job_id; user can return to /processing?job_id={id} to see result. Real-time polling is future enhancement.

## Requirements

### Functional Requirements

**Testing Policy (Constitution Rule 6)**: This project does NOT include unit, integration, or E2E tests. All acceptance criteria MUST be verified through manual testing or other non-automated methods.

- **FR-001**: Frontend MUST display a centered box with background color #212121 on the /processing page
- **FR-002**: Frontend MUST play bot-animation.mp4 file in loop within the centered box
- **FR-003**: Frontend MUST display status text beneath the animation
- **FR-004**: Frontend MUST display processing page with generic message "Processing your video..."; backend returns final result when complete
- **FR-005**: Backend MUST receive video metadata including Cloudinary URL from Next.js frontend
- **FR-006**: Backend MUST download video from Cloudinary URL to local server storage
- **FR-007**: Backend MUST return processing-start signal to Next.js, which then performs client-side redirect to /processing page immediately
- **FR-008**: Backend MUST upload downloaded video file to Google Gemini files API after download completes
- **FR-009**: Backend MUST use langchain-google-genai library for Gemini API interaction
- **FR-010**: Backend MUST delete local video file after AI pipeline completes
- **FR-011**: Backend MUST handle and report errors appropriately to frontend
- **FR-012**: Backend MUST expose API endpoint for Next.js to initiate video processing

### Key Entities

- **VideoData**: Contains video metadata including Cloudinary URL, user ID, video ID
- **ProcessingJob**: Tracks video processing status (pending, downloading, uploading, processing, complete, failed)
- **GeminiFileRef**: Reference to uploaded video in Gemini (file ID, URI)
- **LocalVideoFile**: Temporary file stored during processing (path, size, cleanup status)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view processing status page within 2 seconds of initiating video processing
- **SC-002**: User is redirected to /processing page immediately when backend begins downloading video
- **SC-003**: Status text on processing page displays generic "Processing your video..." message
- **SC-004**: Video animation plays smoothly without interruption during entire processing duration
- **SC-005**: Video file is successfully downloaded from Cloudinary and uploaded to Gemini API
- **SC-006**: Local video file is removed from server after processing completes
- **SC-007**: Error states are displayed clearly to users with actionable messages

### Success Conditions

1. Processing page displays with dark (#212121) centered box containing looping video animation and status text
2. User is automatically redirected to /processing when video processing begins
3. Status text displays generic "Processing your video..." message while backend completes work
4. Video is successfully downloaded from Cloudinary and uploaded to Gemini files API
5. Local video file is cleaned up after processing completes
6. System handles errors gracefully and displays appropriate messages

## Assumptions

- Cloudinary URL provided by Next.js is valid and accessible
- Gemini API credentials are configured in backend environment
- bot-animation.mp4 file exists in frontend assets
- /processing route exists in Next.js routing
- Video files are within reasonable size limits for download/upload
- Network connectivity is stable between all services
