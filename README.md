# GoViral

AI-powered SEO automation for short-form videos. Upload a video, get optimized titles, descriptions, tags, and thumbnails optimized for discoverability.

## The Problem

Creating SEO-optimized metadata for videos is time-consuming and requires expertise. Content creators spend hours researching keywords, writing descriptions, and optimizing tags for every upload.

## The Solution

GoViral automates the entire SEO workflow using AI. Upload a short-form video, and the app analyzes its visual and audio content, generates SEO-ready metadata, runs safety checks, and delivers a human-reviewable package ready for approval.

## How It Works

1. **Upload** — Drag and drop your video (MP4, MOV, AVI up to 50MB, max 60s)
2. **AI Analysis** — The AI agent pipeline processes your video through three stages:
   - **Security Check** — Content safety analysis (stops processing if unsafe)
   - **SEO Generation** — Title, description, tags, category, and viral score
   - **Thumbnail Generation** — AI-generated thumbnail based on video content
3. **Review & Edit** — Review the generated metadata and make any edits

## Architecture

GoViral uses a **dual-backend architecture** with strict separation of concerns.

```
┌─────────────────────────────────────────────────────┐
│                   User Browser                       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Next.js (Vercel)                        │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  React UI │  │ Clerk    │  │  API Routes       │  │
│  │  (SSR/CSR)│  │ Auth     │  │  /api/videos      │  │
│  └──────────┘  └──────────┘  │                   │  │
│                              │  /api/user/*       │  │
│  ┌──────────┐  ┌──────────┐  └─────────┬─────────┘  │
│  │ MongoDB  │  │Cloudinary│            │             │
│  │ (Mongoose)│  │ (Upload) │            │             │
│  └──────────┘  └──────────┘            │             │
└────────────────────────────────────────┼────────────┘
                                         │ HTTP REST
┌────────────────────────────────────────▼────────────┐
│          Python Agent Service (Railway)              │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Security     │  │ SEO          │  │ Thumbnail  │ │
│  │ Check Agent  │→ │ Generation   │→ │ Generation │ │
│  │ (Gemini Flash)│  │ Agent (Pro)  │  │ Agent      │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
│  FastAPI + LangChain + Google Gemini                 │
└──────────────────────────────────────────────────────┘
```

### Web App (Next.js)

The primary backend and frontend, responsible for user interaction, data persistence, and orchestration.

| Responsibility | Technology |
|---|---|
| UI & SSR | Next.js 16.1.1, React 19.2.3 |
| Styling | Tailwind CSS v4 |
| Authentication | Clerk (`@clerk/nextjs` v6.38.2) |
| Database | MongoDB via Mongoose v9.1.3 |
| Video Storage | Cloudinary (upload, hosting) |

| HTTP Client | Axios v1.13.2 |

### AI Agent Service (Python)

A dedicated microservice for AI processing. It does **not** connect to the database — all data flows through the Next.js backend.

| Responsibility | Technology |
|---|---|
| Web Framework | FastAPI v0.128.0+ |
| AI Framework | LangChain v1.2.10+ |
| LLM Provider | Google Gemini (via `langchain-google-genai` v4.2.1+) |
| Linting | Ruff |

## Tech Stack

### Frontend

- **Next.js 16.1.1** — App Router, Server Components, Partial Prerendering
- **React 19.2.3** — Server Actions, `use` hook, optimistic updates
- **Tailwind CSS v4** — Utility-first styling, `@theme` configuration
- **TypeScript 5** — Static typing
- **react-icons 5.5.0** — Icon library

### Backend

- **Next.js API Routes** — REST endpoints for videos, auth, Cloudinary signing
- **MongoDB** — User accounts, video metadata
- **Mongoose 9.1.3** — ODM with schema validation and indexing
- **Clerk** — Managed authentication with pre-built UI components

### AI Service

- **Python 3.12+**
- **FastAPI** — Async REST API
- **LangChain** — Agent orchestration and chaining
- **Google Gemini** — Video analysis, content generation, thumbnail creation

### External Services

- **Cloudinary** — Video upload, storage, and delivery (signed uploads)
- **MongoDB Atlas** — Cloud database
- **Clerk** — User management and authentication

## Project Structure

```
GoViral-project/
├── web_app/                      # Next.js application
│   ├── src/
│   │   ├── app/                  # App Router pages & API routes
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── upload/           # Upload page + client component
│   │   │   ├── sign-in/          # Clerk sign-in
│   │   │   ├── sign-up/          # Clerk sign-up
│   │   │   └── api/              # REST API endpoints
│   │   │       ├── videos/       # Video CRUD operations
│   │   │       ├── cloudinary/   # Upload signing
│   │   │       └── user/         # User status checks
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, Sidebar, Footer
│   │   │   ├── homepage/         # Hero, Upload, Features sections
│   │   │   ├── upload/           # Upload widget, progress bar
│   │   │   └── ui/               # Reusable UI primitives
│   │   ├── models/               # Mongoose schemas (User, Video)
│   │   ├── lib/                  # DB connection, Cloudinary, utils
│   │   └── middleware.ts         # Clerk auth middleware
│   ├── public/                   # Static assets (logos, animations)
│   └── .env.example              # Environment variable template
│
├── agent_backend/                # Python AI microservice
│   ├── main.py                   # FastAPI entry point (planned)
│   ├── pyproject.toml            # Dependencies & config
│   ├── app/                      # Application package
│   └── uv.lock                   # Dependency lockfile
│
├── design/                       # UI design files
│   ├── homepage_desktop.png
│   ├── homepage_mobile.png
│   ├── sidebar_mobile.png
│   └── FigmaLink.txt
│
├── specs/                        # Feature specifications
│   ├── 001-homepage-initial/     # Homepage feature spec
│   ├── 002-video-upload/         # Upload flow spec
│   └── 003-ai-agent/            # AI agent pipeline spec
│
├── AGENTS.md                     # Project conventions & AI agent rules
└── .specify/                     # Spec-driven development tooling
```

## API Reference

### Web App Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/videos` | Yes | Store video metadata after Cloudinary upload |
| `GET` | `/api/videos` | Yes | List user's videos (supports `limit` and `status` filters) |
| `GET` | `/api/videos/[id]` | Yes | Get a single video by ID |
| `POST` | `/api/cloudinary/sign-cloudinary-params` | Yes | Sign Cloudinary upload parameters |

### Video Status Lifecycle

```
pending → processing → completed
                    ↘ failed
```

## Database Models

### User

| Field | Type | Description |
|---|---|---|
| `clerkId` | String | Unique Clerk user ID |
| `name` | String | User's display name |
| `email` | String | Unique email address |

### Video

| Field | Type | Description |
|---|---|---|
| `userId` | String | Links to User.clerkId |
| `originalFilename` | String | Original file name |
| `size` | Number | File size in bytes (max 50MB) |
| `duration` | Number | Duration in seconds (max 60s) |
| `status` | String | pending / processing / completed / failed |
| `cloudinaryUrl` | String | Hosted video URL |
| `thumbnailUrl` | String | Generated thumbnail URL |
| `aiResponse` | Object | `{ title, description, tags[], viralScore }` |

## Authentication

**User Authentication (Clerk)** — Handles sign-up, sign-in, session management. Public routes: `/`, `/sign-in/*`, `/sign-up/*`. All other routes require authentication.

## Environment Variables

### Web App (`web_app/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `AGENT_SERVICE_URL` | Python agent service URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_APP_URL` | Application URL |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- MongoDB Atlas account
- Cloudinary account
- Clerk account

### Web App

```bash
cd web_app
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Agent Service

```bash
cd agent_backend
uv sync
uv run fastapi dev main.py
```

Runs on [http://localhost:8000](http://localhost:8000).

## Deployment

| Service | Platform | Tier |
|---|---|---|
| Web App (Next.js) | Vercel | Free |
| AI Agent Service | Railway | Free (1 vCPU, 0.5 GB RAM, 0.5 GB storage) |

## Design

UI designs are available in the `/design/` directory and on [Figma](https://www.figma.com/design/VUirdOyMIrw0zOox1Hf3ne/GoViral-project?node-id=0-1&p=f&t=KOq6rXsKGI9se3DP-0).

## License

This project is a portfolio project by Saad Ali.
