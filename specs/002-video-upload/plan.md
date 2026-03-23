# Implementation Plan: Video Upload with YouTube OAuth & Cloudinary

**Branch**: `002-video-upload` | **Date**: 2026-03-10 | **Updated**: 2026-03-11 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a complete video upload feature for GoViral that enables signed-in users to upload short-form videos (<60s, <50MB) to Cloudinary storage, with integrated YouTube OAuth 2.0 verification for future publishing. The feature includes frontend security checks (pre-upload: file type/size; post-upload: duration), real-time upload progress, metadata storage in MongoDB, and agent service notification (dummy URL for now). YouTube OAuth flow is triggered by two conditions: (1) when upload process starts after login check, and (2) via a dedicated 'Connect YouTube' button in the Navbar/Sidebar. The feature is fully SEO and performance optimized with no upload state persistence.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.1.1, React 19.2.3
**Primary Dependencies**: next-cloudinary (CldUploadWidget), google-auth-library (OAuth 2.0), axios 1.13.2, react-icons 5.5.0
**Storage**: MongoDB (via mongoose 9.1.3), Cloudinary (video/thumbnail storage)
**Testing**: N/A (Excluded per Constitution Rule 6)
**Target Platform**: Web application (Next.js SSR/CSR hybrid)
**Project Type**: web (frontend + backend in Next.js, AI Agent Service deferred to future feature)
**Performance Goals**: Upload progress updates in real-time, p95 < 200ms for API responses, Lighthouse score >90 for performance/accessibility/best practices
**Constraints**: Video max 60s duration, max 50MB size, formats: MP4/MOV/AVI; SEO-optimized pages with dynamic metadata; mobile-responsive UI; no upload state persistence
**Scale/Scope**: Upload page (/upload) with centered widget, OAuth callback endpoint, API routes for signing and metadata storage, 'Connect YouTube' button in Navbar/Sidebar

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Technology Stack Compliance**:
- [x] Frontend: Next.js, React, Tailwind CSS, TypeScript only
- [x] Backend: Next.js API routes (Python Agent Service deferred)
- [x] No unauthorized dependencies (next-cloudinary and google-auth-library are standard for this use case)

**Quality Standards**:
- [x] Code follows industry best practices and production-grade standards
- [x] UI is fully responsive and mobile-optimized
- [x] Performance meets production requirements; no compromises documented
- [x] SEO optimized for search engine ranking with good Lighthouse scores
- [x] Code is clean, professional, well-commented, and modular

**Development Practices**:
- [x] Existing code reused; search conducted before creating new functions
- [x] DRY principle followed; no duplicate implementations
- [x] Dependencies are minimal and approved (next-cloudinary, google-auth-library)
- [x] Only explicitly requested features implemented; no additional functionality

**Testing Compliance (CRITICAL - Rule 6)**:
- [x] NO unit tests included
- [x] NO integration tests included
- [x] NO E2E tests included
- [x] NO test files or test directories created
- [x] All verification will be manual or through other non-automated methods

## Project Structure

### Documentation (this feature)

```text
specs/002-video-upload/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── openapi.yaml     # API contract specification
│   └── youtube-oauth.md # OAuth flow contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
web_app/
├── src/
│   ├── app/
│   │   ├── upload/
│   │   │   └── page.tsx           # Upload page with CldUploadWidget centered, SEO metadata
│   │   └── api/
│   │       ├── auth/
│   │       │   └── youtube/
│   │       │       ├── route.ts   # Initiate YouTube OAuth flow
│   │       │       └── callback/
│   │       │           └── route.ts # Handle OAuth callback
│   │       ├── cloudinary/
│   │       │   └── sign-cloudinary-params/
│   │       │       └── route.ts   # Sign Cloudinary upload params
│   │       └── videos/
│   │           └── route.ts       # Store video metadata after upload
│   ├── components/
│   │   ├── upload/
│   │   │   ├── VideoUploadWidget.tsx  # Wrapper for CldUploadWidget with progress
│   │   │   └── UploadProgress.tsx     # Progress indicator component
│   │   └── layout/
│   │       └── ConnectYouTubeButton.tsx  # YouTube connection button for Navbar/Sidebar
│   ├── lib/
│   │   ├── cloudinary.ts        # Cloudinary configuration
│   │   ├── youtube-oauth.ts     # YouTube OAuth utilities
│   │   └── db.ts                # MongoDB connection
│   └── models/
│       ├── Video.ts             # VideoUpload schema with User relationship
│       └── User.ts              # User schema with YouTube credentials
└── .env.local               # Environment variables (already configured)
```

**Structure Decision**: Single Next.js project structure (web_app/) with API routes handling backend logic. AI Agent Service implementation deferred to future feature as per user requirements.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | No violations | N/A - Plan complies with Constitution |

---

## Phase 0: Research & Decisions

### Research 1: Cloudinary Signed Upload with next-cloudinary

**Decision**: Use `CldUploadWidget` from `next-cloudinary` with signed uploads via `/api/cloudinary/sign-cloudinary-params` endpoint

**Rationale**:
- Signed uploads provide better security and control over upload parameters
- CldUploadWidget provides built-in progress tracking, multiple file source support, and customizable UI
- Upload preset 'GoViral-Video' already configured in Cloudinary console
- Library has 380 code snippets, Medium reputation, 87.3 benchmark score

**Alternatives considered**:
- Unsigned uploads: Rejected due to security concerns and lack of server-side validation
- Direct API upload: Rejected due to complexity and reinventing widget functionality
- Alternative libraries (cloudinary-core): Rejected due to less React integration

**Implementation pattern**:
```tsx
<CldUploadWidget
  signatureEndpoint="/api/cloudinary/sign-cloudinary-params"
  uploadPreset="GoViral-Video"
  options={{
    sources: ['local', 'camera', 'url'],
    maxFiles: 1,
    resourceType: 'video',
    clientAllowedFormats: ['mp4', 'mov', 'avi'],
    maxFileSize: 52428800, // 50MB
  }}
  onSuccess={(result, { widget }) => {
    // Handle metadata storage
    widget.close();
  }}
  onError={(error) => {
    // Show error to user
  }}
>
  {({ open, isLoading }) => (
    <button onClick={() => open()} disabled={isLoading}>
      {isLoading ? 'Uploading...' : 'Upload Video'}
    </button>
  )}
</CldUploadWidget>
```

### Research 2: YouTube OAuth 2.0 Flow

**Decision**: Use Google OAuth 2.0 with authorization code flow, offline access for refresh tokens, scopes for YouTube upload

**Rationale**:
- Required scopes: `https://www.googleapis.com/auth/youtube.upload` and `https://www.googleapis.com/auth/youtube`
- Offline access (`access_type: 'offline'`) ensures refresh token for long-term access
- `prompt: 'consent'` ensures refresh token is returned on first authorization
- Callback URI: `http://localhost:3000/api/auth/youtube/callback` (configured in Google Cloud Console)
- Credentials stored encrypted in User document (accessToken, refreshToken, expiry, channelId)

**Alternatives considered**:
- OAuth 2.0 implicit flow: Rejected due to security concerns (tokens exposed in URL)
- Service account authentication: Rejected - requires user consent for YouTube upload
- PKCE flow: Considered but standard authorization code flow sufficient for server-side app

**Implementation pattern**:
```typescript
// Initiate OAuth flow
const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID,
  process.env.GOOGLE_YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/youtube/callback'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ],
  prompt: 'consent'
});

// Handle callback and exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
// Store tokens encrypted in User document
```

### Research 3: Frontend Video Validation

**Decision**: Validate video duration using Cloudinary upload widget constraints and frontend file checks

**Rationale**:
- Cloudinary widget supports `maxFileSize` and `clientAllowedFormats` options
- Duration validation requires metadata extraction post-upload or frontend analysis
- For <60s constraint, use Cloudinary transformation/validation or reject post-upload if exceeds
- Frontend file type and size checks provide immediate feedback before upload

**Alternatives considered**:
- FFmpeg.wasm for client-side duration check: Rejected due to bundle size and complexity
- Post-upload validation only: Rejected - user should know before upload completes
- Server-side validation: Partial - used as backup but frontend provides better UX

### Research 4: Upload Progress Tracking

**Decision**: Use CldUploadWidget built-in progress callbacks and event handlers

**Rationale**:
- CldUploadWidget provides `onProgress`, `onSuccess`, `onError` callbacks
- Progress percentage available in callback results
- Widget handles retry logic and network interruptions
- Custom progress UI can be built using callback data

**Implementation pattern**:
```tsx
<CldUploadWidget
  onProgress={(result, { widget }) => {
    const { loaded, total } = result.event;
    const percentage = Math.round((loaded / total) * 100);
    setUploadProgress(percentage);
  }}
  onSuccess={(result, { widget }) => {
    // result.info contains secure_url, public_id, duration, bytes
  }}
>
```

### Research 5: MongoDB Schema for Video Upload

**Decision**: Embed YouTube credentials in User document, separate Video collection with Clerk ID reference

**Rationale**:
- One-to-many relationship: User → VideoUploads
- YouTube credentials (encrypted) stored in User document for quick OAuth status check
- Video document contains: clerkId, cloudinaryUrl, fileSize, duration, status, error, timestamps
- Status enum: pending, processing, completed, failed, published
- Index on clerkId for efficient user video queries

### Research 6: SEO Optimization for Upload Page

**Decision**: Implement comprehensive SEO optimization for /upload page using Next.js 16 App Router metadata API

**Rationale**:
- Next.js 16 App Router provides built-in metadata API for dynamic SEO
- Metadata includes title, description, Open Graph tags, Twitter cards
- Semantic HTML structure improves crawlability
- Fast load times contribute to better search rankings
- Performance optimization aligns with Constitution Principle #7

**Implementation pattern**:
```tsx
// app/upload/page.tsx
export const metadata = {
  title: 'Upload Video - GoViral | AI-Powered YouTube SEO Optimization',
  description: 'Upload your short-form videos to GoViral for AI-powered SEO optimization. Automatically generate titles, descriptions, tags, and thumbnails for YouTube.',
  keywords: ['video upload', 'YouTube SEO', 'AI optimization', 'short-form video', 'content creator tools'],
  openGraph: {
    title: 'Upload Video - GoViral',
    description: 'AI-powered YouTube SEO optimization for short-form videos',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upload Video - GoViral',
    description: 'AI-powered YouTube SEO optimization',
  },
}
```

### Research 7: Connect YouTube Button Placement

**Decision**: Implement 'Connect YouTube' button in Navbar/Sidebar with conditional rendering based on OAuth status

**Rationale**:
- Provides proactive YouTube connection without interrupting upload flow
- Improves user experience by allowing setup at user's convenience
- Button visibility controlled by checking youtubeCredentials in User document
- Consistent placement in main navigation ensures discoverability

**Implementation pattern**:
```tsx
// components/layout/ConnectYouTubeButton.tsx
async function ConnectYouTubeButton() {
  const user = await getCurrentUser();
  const hasYouTubeConnection = user?.youtubeAccessToken && 
    new Date(user.youtubeTokenExpiry) > new Date();

  if (hasYouTubeConnection) {
    return <ConnectedIndicator />;
  }

  return (
    <form action="/api/auth/youtube">
      <button type="submit">Connect YouTube</button>
    </form>
  );
}
```

### Research 8: No Upload State Persistence Strategy

**Decision**: Implement ephemeral upload state with no persistence for resumeability

**Rationale**:
- Per spec requirement FR-010: no upload state persistence
- Simplifies implementation and reduces database writes
- Upload cancelled if user navigates away
- State managed entirely in client-side React component state
- Aligns with short-form video use case (quick uploads)

**Implementation approach**:
- Use React useState/useEffect for upload progress state
- No localStorage/sessionStorage persistence
- No background sync or service workers
- Upload widget unmount = upload cancelled

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions, validation rules, and state transitions.

**Key Entities**:
1. **User** (existing, extended): YouTube OAuth credentials embedded (accessToken, refreshToken, tokenExpiry)
2. **Video**: Collection for video upload tracking (userId/clerkId, cloudinaryUrl, thumbnailUrl, size, duration, status, aiResponse)

### API Contracts

See [contracts/](./contracts/) for OpenAPI specification.

**Endpoints**:
1. `GET /api/auth/youtube` - Initiate YouTube OAuth flow (triggered by upload or Connect YouTube button)
2. `GET /api/auth/youtube/callback` - Handle OAuth callback
3. `POST /api/cloudinary/sign-cloudinary-params` - Sign Cloudinary upload parameters
4. `POST /api/videos` - Store video metadata after upload
5. `GET /api/videos/[id]` - Get video upload status

### Security Checks Order

**Pre-upload checks** (run before upload starts):
- File type validation (MP4, MOV, AVI only)
- File size validation (< 50MB)

**Post-upload checks** (run after Cloudinary response):
- Video duration validation (< 60 seconds)
- Duration check runs after receiving Cloudinary response with duration metadata

### Quickstart Guide

See [quickstart.md](./quickstart.md) for implementation steps and code examples.

---

## Phase 2: Implementation Sequence (Summary)

1. **Setup**: Install next-cloudinary, configure Cloudinary SDK
2. **YouTube OAuth**: Implement OAuth initiation and callback routes
3. **Cloudinary**: Implement signing endpoint and upload widget
4. **Video Model**: Create Video.ts schema with validation
5. **Upload Flow**: Build /upload page with centered widget, progress, and SEO metadata
6. **Metadata Storage**: Store video data and notify agent service (dummy URL)
7. **Error Handling**: Implement comprehensive error messages per spec
8. **UI Polish**: Responsive design, loading states, success/error feedback
9. **Connect YouTube Button**: Add button to Navbar/Sidebar with conditional rendering
10. **SEO Optimization**: Ensure /upload page has complete metadata and semantic HTML

---

**Last updated**: 2026-03-11 | **Constitution Version**: 1.1.0 | **Compliance**: ✓
