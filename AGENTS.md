# Project / Repo Overview

**Purpose**: GoViral app automates SEO preparation and publishing for short-form videos on Youtube. It takes an uploaded video, analyzes video and audio, produces SEO-ready metadata (titles, short/long descriptions, tags, hashtags, keywords), runs safety checks, and delivers a human-reviewable package that can be published to YouTube on approval.

**The Problem this project solves**: Creating SEO-optimized metadata for videos is time-consuming and requires expertise. GoViral leverages AI to automate this process, saving content creators time and improving their video's reach and help them grow on Youtube.

# Technology Stack & Architecture

The application utilizes a **Dual-Backend Architecture**. Responsibilities are strictly divided as follows:

## 1. Primary Backend & Frontend (Next.js)

- **Role**: Handles the User Interface, Authentication, Database interactions, and orchestration. acts as the main gateway.
- **Stack**: Next.js 16.1.1, React 19.2.3, React DOM 19.2.3, Tailwind CSS v4, TypeScript 5.
- **External dependencies/libraries**: Axios 1.13.2, react-icons 5.5.0.
- **Database**: MongoDB (Connected via Next.js not python), mongoose 9.1.3.
- **Responsibilities**:
  - Manage all User Authentication (Auth).
  - Read/write to the MongoDB database via mongoose.
  - Serve the UI.
  - Send requests to the Python Agent Service when AI logic is required.

The folder for this part of the codebase is `/web_app/` in the root directory.

## 2. AI Agent Service (Python)

- **Role**: A dedicated microservice specifically for AI Agent logic.
- **Stack**: Python ≥3.12, FastAPI ≥0.128.0, LangChain (≥1.2.10), Google Gemini (via langchain-google-genai >= 4.2.1).
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

# Very Important Notes

- This is my portfolio project, and i am planning to deploy the Next.js app on (Vercel free tier) and python agent service/backend on (Railway free tier -- 1 vCPU + 0.5 GB RAM + 0.5 GB Volume storage). So, please keep that in mind before doing anything and while making changes.

- Every API response should complete within 10 seconds to avoid timeouts on vercel serverless functions and the Railway free tier. If any AI processing is expected to take longer, implement a polling mechanism or asynchronous processing with status updates or first send a generic response and send actual results afterwards or make an api in next.js that the python server directly calls to send the actual results.

- Always follow the rules in `.specify/memory/constitution.md` and when making decisions or taking actions.

- Use the full potential and power of all technologies in the stack, especially the capabilities of Next.js 16 for better performance and SEO optimizations for this project.

- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

- designs are in `/design/` directory in root repo along with the Figma Link to the designs.
