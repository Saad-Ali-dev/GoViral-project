# Project / Repo Overview

**Purpose**: GoViral app automates SEO preparation and publishing for short-form videos on Youtube. It takes an uploaded video, analyzes video and audio, produces SEO-ready metadata (titles, short/long descriptions, tags, hashtags, keywords), runs safety checks, and delivers a human-reviewable package that can be published to YouTube on approval.

**The Problem this project solves**: Creating SEO-optimized metadata for videos is time-consuming and requires expertise. GoViral leverages AI to automate this process, saving content creators time and improving their video's reach and help them grow on Youtube.

# Technology Stack & Architecture

The application utilizes a **Dual-Backend Architecture**. Responsibilities are strictly divided as follows:

## 1. Primary Backend & Frontend (Next.js)

- **Role**: Handles the User Interface, Authentication, Database interactions, and orchestration. acts as the main gateway.
- **Stack**: Next.js 16.1.1, React 19.2.3, React DOM 19.2.3, Tailwind CSS v4, TypeScript 5.
- **Database**: MongoDB (Connected via Next.js not python), mongoose 9.1.3.
- **Responsibilities**:
  - Manage all User Authentication (Auth).
  - Read/write to the MongoDB database via mongoose.
  - Serve the UI.
  - Send requests to the Python Agent Service when AI logic is required.

The folder for this part of the codebase is `/web_app/` in the root directory.

## 2. AI Agent Service (Python)

- **Role**: A dedicated microservice specifically for AI Agent logic.
- **Stack**: Python ≥3.12, FastAPI ≥0.128.0, openai-agents ≥0.6.4.
- **Responsibilities**:
  - Host the AI Agents.
  - Expose endpoints (API) that the Next.js backend calls.
  - **Constraint**: This service MUST NOT connect to the database directly. It receives data from Next.js and returns AI responses.

The folder for this part of the codebase is `/agent_backend/` in the root directory.

## 3. Communication

- Communication between Next.js and Python occurs via HTTP REST API calls.

## 4. No Testing

- There are no (unit/integrated/e2e) automated tests in this codebase. All development follows strict production standards without test suites.

# Commands

- To Start Next.js dev server make sure you are in `/web_app/` directory from the root repo then run `npm run dev`

# Coding Conventions & Style

- **Components:** Functional components with `export function` (no arrow functions for components).

# Boundaries & Safety

- **Ask First:** Before installing new `npm` packages or changing database schemas.
- **Never:** Modify `.env` files, `node_modules/`.
