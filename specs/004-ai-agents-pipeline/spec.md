# Feature Specification: AI Agents Pipeline

**Feature Branch**: `004-ai-agents-pipeline`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "004-ai-agents-pipeline — Create security check agent and SEO generator agent. @AGENTS.md @.specify\memory\constitution.md"

## Clarifications

### Session 2026-05-21

- Q: What format should the viral score use? → A: Percentage scale (0-100%)
- Q: Where should pipeline state be stored for persistence? → A: MongoDB database via Next.js backend
- Q: What happens when security check fails? → A: Video is completely blocked; no further action allowed
- Q: Who decides when to trigger the research tool? → A: SEO agent decides autonomously based on content analysis
- Q: How should long-running pipeline execution handle API timeout constraints? → A: Async initiation + polling status endpoint from Next.js

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Security Check Agent (Priority: P1)

A content creator uploads a short-form video to GoViral. Before any metadata is generated, the system automatically runs a content safety check. The security check agent analyzes the video content and audio for violations such as sexual content, abusive content, and other content not allowed on YouTube. The agent outputs a single boolean value (pass/fail). If the check fails, the pipeline stops and the user is notified. If it passes, the pipeline proceeds to the SEO generator agent.

**Why this priority**: Safety and compliance are critical before any content reaches YouTube. A single policy violation can result in strikes, demonetization, or channel termination. This must be the first gate in the pipeline.

**Independent Test**: Can be fully tested by uploading videos with known violations (sexual content, abusive content) and verifying the agent returns false, and by uploading clean content and verifying it returns true. Delivers immediate risk mitigation value.

**Acceptance Scenarios**:

1. **Given** a user uploads a video containing sexual or abusive content, **When** the security check agent analyzes the content, **Then** the agent returns false, the pipeline stops, and the video is completely blocked from further processing
2. **Given** a user uploads a video that complies with YouTube content guidelines, **When** the security check agent analyzes the content, **Then** the agent returns true and the pipeline proceeds to the SEO generation stage
3. **Given** a video fails the security check, **When** the user receives the result, **Then** they are notified that the content was flagged and cannot proceed with SEO generation or publishing for that video

---

### User Story 2 - SEO Generator Agent with Research and Category Resolution (Priority: P1)

After a video passes the security check, the SEO generator agent takes over. It first deeply analyzes the video content and audio transcript. Based on its analysis, the SEO agent autonomously decides whether to use a research agent tool to gather current, niche-specific information from the web (best short-form strategies, hooks, keyword techniques, trending titles and descriptions for the video's niche). It also uses a resolve_category_id tool to fetch the latest category data directly from the YouTube API. Based on all gathered information, the agent produces a complete SEO package: a viral score (probability of the content going viral on YouTube after SEO optimizations), an optimized title, a description, tags/keywords and category_id. The user can review and edit all outputs before publishing.

**Why this priority**: SEO metadata is the core value proposition of GoViral. The viral score gives users confidence in their content's potential, while research-backed metadata maximizes discoverability. This is the primary feature users expect.

**Independent Test**: Can be fully tested by providing a video and verifying the generated metadata (title, description, tags, category, viral score) is relevant, SEO-optimized, and follows YouTube best practices. The research tool can be verified by checking that niche-specific data was incorporated.

**Acceptance Scenarios**:

1. **Given** a video has passed the security check, **When** the SEO generator agent processes the content, **Then** it first performs a deep analysis of the video before generating any metadata
2. **Given** the SEO generator is processing a video, **When** the agent determines niche-specific research would add value, **Then** it autonomously triggers the research tool to gather current strategies, hooks, keyword techniques, and trending metadata for the video's niche
3. **Given** the SEO generator needs to assign a YouTube category, **When** it needs to resolve the category, **Then** it uses the resolve_category_id tool to fetch the latest category data directly from the YouTube API
4. **Given** the SEO generator completes processing, **When** the output is delivered, **Then** it includes a viral score, an optimized title (ideally 40-50 characters, max 100), a description (first 2-3 lines are 100-150 words and contain main keywords/tags, max 5000 words), and optimized tags/keywords and category relevant to the content and YouTube data.
5. **Given** the viral score is generated, **When** the user reviews it, **Then** it is displayed as a percentage (0-100%) representing the final probability and chances of the short content going viral and being successful on YouTube after all SEO optimizations
6. **Given** generated metadata is presented to the user, **When** the user reviews the package, **Then** all outputs (title, description, tags, category) are editable and the user can modify them as desired

---

### User Story 3 - Pipeline with State and Progress Persistence (Priority: P2)

A content creator initiates the AI pipeline on their uploaded video. The pipeline runs sequentially: security check first, then SEO generation if passed. At any point, the user can navigate away from the page. When they return, the system shows the current progress and state of the pipeline without requiring a restart. The user can see which stage is complete, which is in progress, and what remains. Once the full pipeline completes, the results persist and are available for review and editing.

**Why this priority**: Pipeline processing can take time. Users should not lose progress if they navigate away or close the browser. State persistence ensures a seamless experience and avoids wasted processing.

**Independent Test**: Can be fully tested by starting a pipeline, navigating away mid-process, returning after some time, and verifying the current progress is displayed correctly without restarting. Also test that completed results persist across sessions.

**Acceptance Scenarios**:

1. **Given** a user starts the AI pipeline on a video, **When** they initiate processing, **Then** the system immediately acknowledges the request and begins async processing in the background
2. **Given** a pipeline is running asynchronously, **When** the user views the page, **Then** the frontend polls a status endpoint and displays real-time progress updates
3. **Given** a user starts the AI pipeline on a video, **When** they navigate away mid-process, **Then** the pipeline continues running in the background and progress is saved in MongoDB
4. **Given** a user returns to a video with an in-progress pipeline, **When** they view the page, **Then** they see the current progress and state without needing to restart
5. **Given** a pipeline has fully completed, **When** the user returns after some time, **Then** all results (title, description, tags, category) are available for review and editing
6. **Given** the pipeline state is persisted, **When** the user views progress, **Then** they can clearly see which stages are complete, in progress, or pending
7. **Given** a video fails the security check, **When** the user returns to that video, **Then** they see the blocked status and cannot initiate SEO generation for it

---

### Edge Cases

- What happens when the video file is corrupted or cannot be processed by the AI agents?
- How does the system handle videos in languages other than English for both security checks and SEO generation?
- What occurs if the AI agent service is unavailable or times out during processing?
- How does the security check handle borderline content that may or may not violate guidelines?
- What happens when the generated title exceeds 100 characters or the description exceeds 5000 words?
- What occurs if the YouTube API is unavailable when resolving the category?
- What happens if the research tool fails to gather niche-specific information?
- How does the system handle a user returning to a pipeline that failed or was interrupted?
- What happens if the polling status endpoint becomes unavailable or returns errors during progress tracking?
- How does the frontend handle polling when the user's network connection is unstable?

## Requirements _(mandatory)_

### Functional Requirements

**Testing Policy (Constitution Rule 6)**: This project does NOT include unit, integration, or E2E tests. All acceptance criteria MUST be verified through manual testing or other non-automated methods.

- **FR-001**: System MUST provide a security check agent that analyzes uploaded video content for violations including sexual content, abusive content, and other content not allowed on YouTube
- **FR-002**: The security check agent MUST NOT check for copyrighted content
- **FR-003**: The security check agent MUST output a single boolean value (true for pass, false for fail)
- **FR-004**: System MUST completely block videos that fail the security check from proceeding to SEO generation or publishing
- **FR-005**: System MUST provide an SEO generator agent that runs only after the security check passes
- **FR-005**: The SEO generator agent MUST first deeply analyze the video content before generating any metadata
- **FR-006**: The SEO generator agent MUST autonomously decide whether to use the research agent tool based on its content analysis, and when triggered it gathers niche-specific information from the web (short-form strategies, hooks, keyword techniques, trending titles and descriptions)
- **FR-007**: The SEO generator agent MUST have access to a resolve_category_id tool that fetches the latest category data directly from the YouTube API then choose the category for the video based on that data and the video's content and niche
- **FR-008**: The SEO generator agent MUST output a viral score as a percentage (0-100%) representing the probability and chances of the short content going viral and being successful on YouTube after all SEO optimizations
- **FR-009**: The SEO generator agent MUST output an optimized title, ideally 40-50 characters with a maximum of 100 characters
- **FR-010**: The SEO generator agent MUST output a description where the first 2-3 lines are 100-150 words, contain main keywords and tags, and have a maximum of 5000 words
- **FR-011**: The SEO generator agent MUST output optimized tags/keywords that are relevant to the content, searchable, and aligned with viral potential
- **FR-012**: The SEO generator agent MUST output a YouTube category resolved via the YouTube API
- **FR-013**: System MUST allow users to review and edit all AI-generated outputs (title, description, tags, viral score, category) as desired
- **FR-014**: System MUST implement state and progress management that persists pipeline progress in MongoDB via the Next.js backend across user navigation and sessions
- **FR-015**: System MUST display current pipeline progress to the user when they return to a video with an in-progress or completed pipeline
- **FR-016**: System MUST NOT require users to restart the pipeline if they navigate away and return
- **FR-017**: System MUST communicate with the Python AI Agent Service via HTTP REST API calls from the Next.js backend
- **FR-018**: System MUST use an async execution pattern where pipeline initiation returns immediately and the Next.js frontend polls a status endpoint for progress updates to comply with serverless timeout constraints

### Key Entities

- **Video Upload**: Represents the user-uploaded short-form video file, including metadata such as file path, format, duration, and processing status
- **Security Check Result**: A single boolean value indicating whether the video passed (true) or failed (false) the content safety check
- **SEO Output Package**: Contains the AI-generated metadata including viral score, title, description, tags/keywords, and resolved YouTube category
- **Pipeline State**: Tracks the current progress of the AI pipeline for a given video in MongoDB, including which stages are complete, in progress, or pending, and any intermediate results
- **Viral Score**: A percentage value (0-100%) representing the final probability and chances of the short content going viral and being successful on YouTube after all SEO optimizations

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Security check agent correctly identifies at least 90% of videos containing sexual, abusive, or disallowed content in test samples
- **SC-002**: Security check agent returns false positives (flagging clean content) at a rate below 5%
- **SC-003**: SEO generator produces relevant, usable metadata (title, description, tags, category) for 95% of uploaded videos without requiring manual regeneration
- **SC-004**: Generated titles are within the 40-50 character ideal range in at least 80% of cases, and never exceed 100 characters
- **SC-005**: Generated descriptions have the first 2-3 lines within 100-150 words and contain main keywords/tags in at least 90% of cases
- **SC-006**: Users can complete the full pipeline (upload → security check → SEO generation → review) in under 5 minutes for a standard short-form video
- **SC-007**: Pipeline progress is accurately restored when a user navigates away and returns in 100% of cases
- **SC-008**: Users can successfully edit all AI-generated outputs without errors or data loss
- **SC-009**: Pipeline execution completes successfully without errors in 95% of uploads under normal operating conditions
