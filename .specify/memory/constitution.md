<!--
SYNC IMPACT REPORT
------------------
Version change: Initial → 1.0.0
Modified principles: N/A (initial constitution)
Added sections:
  - Core Principles (6 principles)
  - Technology & Quality Standards
  - Development Practices
  - Governance

Templates requiring updates:
  ✅ plan-template.md - Constitution Check section exists but needs principle-specific gates
  ⚠ spec-template.md - No explicit testing constraint noted; may need "Tests: Excluded" markers
  ⚠ tasks-template.md - Testing section needs "NOT APPLICABLE" or removal per Rule 6
  ✅ No command template files found

Follow-up TODOs: None
-->

# GoViral Constitution

## Core Principles

### Production Standards

All code and deliverables MUST follow industry best practices and production-grade standards (Exclude Testing). Software MUST be developed using proven patterns, libraries, and approaches suitable for production deployment. Performance MUST NOT be compromised—any tradeoffs require explicit justification and user approval.

### Integrity & Research

Do not hallucinate or fabricate information. When a specific fact, pattern, or approach is unknown, explicitly state "I don't know [specific thing]" and conduct online research to gather accurate information before proceeding. Accuracy and transparency are non-negotiable.

### Technology Stack & Architecture

The application utilizes a **Dual-Backend Architecture**. Responsibilities are strictly divided as follows:

#### 1. Primary Backend & Frontend (Next.js)

- **Role**: Handles the User Interface, Authentication, Database interactions, and orchestration. acts as the main gateway.
- **Stack**: Next.js 16.1.1, React 19.2.3, React DOM 19.2.3, Tailwind CSS v4, TypeScript 5.
- **External dependencies/libraries**: Axios 1.13.2, react-icons 5.5.0.
- **Database**: MongoDB (Connected via Next.js not python), mongoose 9.1.3.
- **Responsibilities**:
  - Manage all User Authentication (Auth).
  - Read/write to the MongoDB database via mongoose.
  - Serve the UI.
  - Send requests to the Python Agent Service when AI logic is required.

#### 2. AI Agent Service (Python)

- **Role**: A dedicated microservice specifically for AI Agent logic.
- **Stack**: Python ≥3.12, FastAPI ≥0.128.0, LangChain (≥1.2.10), Google Gemini (via langchain-google-genai >= 4.2.1).
- **Responsibilities**:
  - Host the AI Agents.
  - Expose endpoints (API) that the Next.js backend calls.
  - **Constraint**: This service MUST NOT connect to the database directly. It receives data from Next.js and returns AI responses.

#### 3. Communication

- Communication between Next.js and Python occurs via HTTP REST API calls.

### User Experience Standards

The entire user interface (UI) MUST be fully responsive and work perfectly on mobile devices. Performance MUST meet production standards; no compromises allowed without explicit user approval and documented justification.

### Code Quality & Reuse

Reuse existing code—do NOT create duplicate versions of already written functionality (DRY principle). Search for existing functions and modules before creating new ones. Code MUST be clean, professional, well-commented, modular, and properly formatted.

### Scope Management

Implement only explicitly requested features—no additional functionality or guess work. If a new dependency is required, ask for approval first. Minimize dependencies; only add what is absolutely necessary.

## Development Practices

- Use industry-standard patterns, frameworks, and libraries appropriate for production software
- Follow all production-level best practices: security, maintainability, scalability
- Reuse existing functions and modules; search before creating new code
- Add new dependencies only after explicit user approval; minimal-dependencies principle
- Write clean, professional code with clear comments and modular structure
- Format code consistently following project conventions
- No guess work or additional features beyond explicit requirements

## Governance

This Constitution governs all development activities. All code and decisions MUST comply with these principles.

**Compliance**:

- Every pull request and code review MUST verify constitution compliance
- Deviations from technology stack or core principles require explicit documentation
- Violations of "no tests" rule (Rule 6) are prohibited

**Amendments**:

- Amendments require explicit user approval
- Document changes with reasoning and impact analysis
- Version MUST follow semantic versioning:
  - MAJOR: Backward incompatible changes (principle removal or fundamental redefinition)
  - MINOR: New principles or materially expanded guidance
  - PATCH: Clarifications, wording fixes, non-semantic refinements

**Review**:

- Conduct regular compliance reviews
- Update constitution as project requirements evolve
- Propose amendments when practices conflict with stated principles

**Version**: 1.0.0 | **Ratified**: 2026-01-14 | **Last Amended**: 2026-01-14
