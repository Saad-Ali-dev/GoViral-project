# Research: Video Upload Feature

**Feature**: 002-video-upload  
**Date**: 2026-03-10  
**Status**: Complete

This document consolidates all research findings for the video upload feature with YouTube OAuth and Cloudinary integration.

---

## Decision 1: Cloudinary Upload Widget Implementation

### What was chosen
Use `CldUploadWidget` from `@cloudinary-react` / `next-cloudinary` package with signed uploads via a Next.js API route endpoint.

### Why chosen
- **Security**: Signed uploads ensure server-side control over upload parameters and prevent unauthorized uploads
- **Built-in Progress**: Widget provides native progress callbacks (`onProgress`, `onSuccess`, `onError`)
- **Upload Preset**: Existing 'GoViral-Video' preset in Cloudinary console can be leveraged
- **Developer Experience**: 380 code snippets available, Medium source reputation, 87.3 benchmark score
- **React Integration**: Render props pattern provides full control over trigger UI while handling complex upload logic internally
- **Multiple Sources**: Supports local file, camera, and URL uploads out of the box

### Alternatives considered
1. **Unsigned uploads**: Simpler but lacks server-side validation and security controls. Rejected for production use.
2. **Direct Cloudinary API with fetch**: More control but requires building progress tracking, retry logic, and error handling from scratch. Rejected due to complexity.
3. **cloudinary-core package**: Lower-level SDK without React-specific components. Rejected in favor of next-cloudinary's better integration.
4. **Custom file input with axios**: Would require implementing drag-drop, progress, preview, and validation manually. Rejected due to time and maintenance cost.

### Implementation reference
```tsx
import { CldUploadWidget } from 'next-cloudinary';

<CldUploadWidget
  signatureEndpoint="/api/cloudinary/sign-cloudinary-params"
  uploadPreset="GoViral-Video"
  options={{
    sources: ['local', 'camera', 'url'],
    maxFiles: 1,
    resourceType: 'video',
    clientAllowedFormats: ['mp4', 'mov', 'avi'],
    maxFileSize: 52428800, // 50MB in bytes
  }}
  onSuccess={(result, { widget }) => {
    console.log('Upload successful:', result.info.secure_url);
    widget.close();
  }}
  onError={(error, { widget }) => {
    console.error('Upload error:', error);
  }}
>
  {({ open, isLoading }) => (
    <button onClick={() => open()} disabled={isLoading}>
      {isLoading ? 'Uploading...' : 'Upload Video'}
    </button>
  )}
</CldUploadWidget>
```

---

## Decision 2: YouTube OAuth 2.0 Authorization Flow

### What was chosen
Google OAuth 2.0 authorization code flow with offline access using `google-auth-library` for Node.js.

### Why chosen
- **Official Library**: Google's officially supported Node.js client for OAuth 2.0
- **Refresh Token Support**: Offline access (`access_type: 'offline'`) ensures long-term API access
- **Required Scopes**: Supports YouTube upload scopes (`youtube.upload`, `youtube`)
- **High Reputation**: Source reputation: High, maintained by Google
- **Token Management**: Built-in token refresh logic using stored refresh tokens
- **Security**: Authorization code flow is more secure than implicit flow for server-side apps

### Alternatives considered
1. **Implicit flow (client-side OAuth)**: Tokens exposed in browser URL, less secure. Rejected for production.
2. **PKCE flow**: More secure for public clients but adds complexity. Not required for server-side Next.js app.
3. **Service account authentication**: Cannot impersonate users for YouTube uploads. Rejected.
4. **google-api-javascript-client**: Browser-focused, less suitable for Next.js API routes. Rejected.

### Required scopes
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos to YouTube
- `https://www.googleapis.com/auth/youtube` - Manage YouTube account data

### Token storage strategy
- **accessToken**: Stored encrypted, short-lived (typically 1 hour)
- **refreshToken**: Stored encrypted, long-lived, used to obtain new access tokens
- **expiry**: Timestamp stored to check token validity before upload
- **channelId**: YouTube channel identifier for publishing

### Implementation reference
```typescript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID,
  process.env.GOOGLE_YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/youtube/callback'
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ],
  prompt: 'consent' // Force refresh token generation on first auth
});

// Exchange code for tokens (in callback handler)
const { tokens } = await oauth2Client.getToken(code);
// tokens includes: access_token, refresh_token, expiry_date, id_token
```

---

## Decision 3: Frontend Video Validation Strategy

### What was chosen
Multi-layer validation approach:
1. **Frontend file checks**: File type and size validation before upload
2. **Cloudinary widget constraints**: `clientAllowedFormats`, `maxFileSize`, `resourceType`
3. **Post-upload duration validation**: Check duration in Cloudinary response, reject if >60s

### Why chosen
- **Immediate Feedback**: Users know instantly if file type/size is invalid
- **Bandwidth Efficiency**: Invalid files rejected before upload starts
- **Duration Challenge**: Client-side duration requires FFmpeg.wasm (large bundle) or server-side check
- **Cloudinary Metadata**: Duration available in upload response (`result.info.duration`)
- **Best Practice**: Layered validation provides defense in depth

### Alternatives considered
1. **FFmpeg.wasm for client-side duration**: Accurate but adds ~20MB bundle size. Rejected for performance.
2. **Server-side validation only**: Wastes bandwidth on invalid uploads. Rejected.
3. **Post-upload rejection only**: Poor UX - user waits for upload then gets error. Partially adopted for duration.

### Validation rules
| Check | When | Method | Error Message |
|-------|------|--------|---------------|
| File type | Before upload | `clientAllowedFormats: ['mp4', 'mov', 'avi']` | "Unsupported file format. Please upload MP4, MOV, or AVI files." |
| File size | Before upload | `maxFileSize: 52428800` (50MB) | "File size exceeds limit. Maximum size is 50MB." |
| Duration | Post-upload | Check `result.info.duration` | "Video duration exceeds limit. Maximum duration is 60 seconds." |
| Resource type | Before upload | `resourceType: 'video'` | (Widget filters non-video files) |

---

## Decision 4: Upload Progress Tracking

### What was chosen
Use CldUploadWidget's built-in progress callbacks (`onProgress`, `onUploadAdded`, `onSuccess`, `onError`)

### Why chosen
- **Native Support**: Widget provides real-time progress events with loaded/total bytes
- **Percentage Calculation**: `Math.round((loaded / total) * 100)` for progress bar
- **Network Resilience**: Widget handles retries and connection issues internally
- **Custom UI**: Callback data allows building custom progress indicators
- **Simplicity**: No additional state management or polling required

### Alternatives considered
1. **Custom XMLHttpRequest with progress events**: More control but loses widget benefits. Rejected.
2. **Polling Cloudinary API**: Inefficient and adds server load. Rejected.
3. **WebSocket progress updates**: Over-engineered for this use case. Rejected.

### Progress UI pattern
```tsx
const [uploadProgress, setUploadProgress] = useState(0);
const [isUploading, setIsUploading] = useState(false);

<CldUploadWidget
  onProgress={(result) => {
    const { loaded, total } = result.event;
    setUploadProgress(Math.round((loaded / total) * 100));
  }}
  onUploadAdded={() => setIsUploading(true)}
  onSuccess={() => setIsUploading(false)}
  onError={() => setIsUploading(false)}
>
  {({ open }) => (
    <div>
      {isUploading && (
        <div className="progress-bar">
          <div style={{ width: `${uploadProgress}%` }}>{uploadProgress}%</div>
        </div>
      )}
      <button onClick={() => open()}>Upload Video</button>
    </div>
  )}
</CldUploadWidget>
```

---

## Decision 5: MongoDB Schema Design

### What was chosen
- **User collection**: Extended with embedded YouTube credentials (encrypted)
- **VideoUpload collection**: Separate collection with Clerk ID reference to User
- **Embedded metadata**: Video metadata embedded in VideoUpload document

### Why chosen
- **One-to-Many Relationship**: Users can have multiple video uploads
- **OAuth Status Check**: Embedded credentials allow quick check without joins
- **Query Performance**: Index on `clerkId` enables fast user video lookups
- **Encryption at Rest**: YouTube tokens stored encrypted per spec requirements
- **Status Tracking**: Enum field for upload lifecycle (pending → processing → completed/failed → published)

### Alternatives considered
1. **Separate YouTubeCredentials collection**: Adds join complexity. Rejected for simplicity.
2. **Video metadata only, no status**: Loses lifecycle tracking. Rejected.
3. **Reference to User instead of clerkId**: Adds unnecessary abstraction. Rejected.

### Schema highlights
```typescript
// User document (extended)
{
  clerkId: string;
  youtubeCredentials?: {
    accessToken: string;      // Encrypted
    refreshToken: string;     // Encrypted
    tokenExpiry: Date;
    channelId?: string;
  };
}

// VideoUpload document
{
  clerkId: string;            // Reference to User
  cloudinaryUrl: string;
  publicId: string;
  fileSize: number;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'published';
  error?: string;
  agentServiceNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Decision 6: Agent Service Notification (Deferred Implementation)

### What was chosen
Send video metadata to a dummy/made-up URL for now, as actual AI Agent Service will be implemented in a future feature.

### Why chosen
- **User Requirement**: Explicitly stated: "For now this is set as a redirect URI... Don't implement the agent service now"
- **Future-Proof**: Architecture allows easy swap to real agent URL later
- **Error Handling**: Dummy URL will fail gracefully, allowing testing of retry/error logic
- **Spec Compliance**: FR-008 requires sending data to agent service

### Implementation approach
```typescript
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000/api/dummy-agent';

try {
  await axios.post(AGENT_SERVICE_URL, {
    videoId: video._id,
    clerkId: video.clerkId,
    cloudinaryUrl: video.cloudinaryUrl,
    duration: video.duration,
    fileSize: video.fileSize,
  });
  await VideoUpload.findByIdAndUpdate(video._id, { agentServiceNotified: true });
} catch (error) {
  // Log error but don't fail upload - agent service is async
  console.error('Agent service notification failed:', error);
}
```

---

## Decision 7: Environment Variables Configuration

### What was chosen
Use existing environment variables as specified by user:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID`
- `GOOGLE_YOUTUBE_CLIENT_SECRET`
- `MONGODB_URI`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_API_KEY`

### Why chosen
- **User Configuration**: Already set up in environment
- **Security**: Secrets (API_SECRET, CLIENT_SECRET) kept server-side only
- **Public Config**: Cloud name and client ID safe for client-side exposure
- **Naming Convention**: NEXT_PUBLIC_ prefix for client-side variables

### Additional variable needed
- `AGENT_SERVICE_URL` (optional, defaults to dummy URL)

---

## Summary of Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Upload Widget | next-cloudinary (CldUploadWidget) | React integration, progress tracking, signed uploads |
| OAuth Library | google-auth-library | Official Google library, refresh token support |
| Database | MongoDB (mongoose) | Existing stack, flexible schema for credentials |
| Storage | Cloudinary | User-configured, video optimization, CDN delivery |
| UI Framework | Tailwind CSS v4 | Existing stack, responsive design |
| State Management | React useState/useEffect | Sufficient for upload progress and OAuth flow |

---

**Research Status**: ✅ Complete  
**All NEEDS CLARIFICATION resolved**: Yes  
**Ready for Phase 1 Design**: Yes
