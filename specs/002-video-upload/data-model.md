# Data Model: Video Upload Feature

**Feature**: 002-video-upload  
**Date**: 2026-03-10  
**Version**: 1.0.0

This document defines the data entities, relationships, validation rules, and state transitions for the video upload feature.

---

## Entity 1: User (Extended)

**Purpose**: Represents an authenticated user with YouTube OAuth credentials for video publishing.

**Collection**: `users` (existing, extended with YouTube credentials)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB primary key |
| `clerkId` | String | Yes | Unique user identifier from Clerk authentication (indexed, unique) |
| `email` | String | Yes | User email address |
| `youtubeCredentials` | YouTubeCredentials | No | Embedded OAuth credentials for YouTube API access |
| `createdAt` | Date | Yes | Document creation timestamp |
| `updatedAt` | Date | Yes | Last update timestamp |

### Embedded Document: YouTubeCredentials

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accessToken` | String | Yes* | Encrypted YouTube OAuth access token |
| `refreshToken` | String | Yes* | Encrypted YouTube OAuth refresh token |
| `tokenExpiry` | Date | Yes* | Access token expiration timestamp |
| `channelId` | String | No | YouTube channel identifier (populated after first upload) |

*Required when `youtubeCredentials` object exists

### Indexes

```typescript
{ clerkId: 1 } // Unique index for fast user lookups
```

### Validation Rules

1. **clerkId**: Must be unique, non-empty string from Clerk authentication
2. **youtubeCredentials.accessToken**: Must be encrypted before storage
3. **youtubeCredentials.refreshToken**: Must be encrypted before storage
4. **youtubeCredentials.tokenExpiry**: Must be a valid future Date when credentials exist

### Encryption Requirements

- YouTube credentials MUST be encrypted at rest using a secure encryption algorithm (e.g., AES-256-GCM)
- Encryption key stored in environment variable (`ENCRYPTION_KEY` or similar)
- Decryption only occurs when tokens are needed for API calls

---

## Entity 2: VideoUpload

**Purpose**: Represents a video upload attempt with metadata, status tracking, and user association.

**Collection**: `video_uploads` (new collection)

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Yes | - | MongoDB primary key |
| `clerkId` | String | Yes | - | Reference to User via Clerk ID (indexed) |
| `cloudinaryUrl` | String | Yes | - | Secure URL from Cloudinary after upload |
| `publicId` | String | Yes | - | Cloudinary public identifier for the video |
| `fileSize` | Number | Yes | - | File size in bytes |
| `duration` | Number | Yes | - | Video duration in seconds |
| `format` | String | Yes | - | Video format (mp4, mov, avi) |
| `status` | String | Yes | 'pending' | Upload lifecycle status (see State Transitions) |
| `error` | String | No | - | Error message if status is 'failed' |
| `agentServiceNotified` | Boolean | Yes | false | Whether agent service was notified |
| `youtubePublishAttempted` | Boolean | Yes | false | Whether YouTube publish was attempted |
| `youtubeVideoId` | String | No | - | YouTube video ID after publishing |
| `metadata` | VideoMetadata | No | - | Additional Cloudinary metadata |
| `createdAt` | Date | Yes | - | Upload initiation timestamp |
| `updatedAt` | Date | Yes | - | Last update timestamp |

### Embedded Document: VideoMetadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resourceType` | String | No | Cloudinary resource type (should be 'video') |
| `width` | Number | No | Video width in pixels |
| `height` | Number | No | Video height in pixels |
| `aspectRatio` | Number | No | Video aspect ratio |
| `tags` | String[] | No | Cloudinary tags |
| `originalFilename` | String | No | Original filename from upload |

### Indexes

```typescript
{ clerkId: 1, createdAt: -1 }  // Composite index for user's videos sorted by date
{ status: 1 }                   // For querying videos by status
{ publicId: 1 }                 // Unique index for Cloudinary reference
```

### Validation Rules

1. **clerkId**: Must be non-empty string, must correspond to existing User
2. **cloudinaryUrl**: Must be valid HTTPS URL from Cloudinary domain
3. **publicId**: Must be non-empty string, unique across collection
4. **fileSize**: Must be positive integer, max 52428800 (50MB)
5. **duration**: Must be positive number, max 60 seconds
6. **format**: Must be one of: 'mp4', 'mov', 'avi'
7. **status**: Must be one of: 'pending', 'processing', 'completed', 'failed', 'published'
8. **error**: Required when status is 'failed'
9. **agentServiceNotified**: Boolean, set to true after agent service notification attempt

### State Transitions

```
pending → processing → completed → published
                     ↓
                   failed
```

**Transition Rules**:

| From | To | Trigger | Validation |
|------|----|---------|------------|
| `pending` | `processing` | Upload starts, security checks pass | File type, size validated |
| `processing` | `completed` | Upload completes, metadata stored | Duration ≤ 60s, all metadata present |
| `processing` | `failed` | Upload fails or validation fails | Error message required |
| `completed` | `published` | Video published to YouTube | YouTube credentials valid, API call succeeds |
| `completed` | `failed` | Post-upload validation fails | Duration > 60s or other error |

**Invalid Transitions**:
- `published` → any (terminal state)
- `failed` → any (terminal state, user must re-upload)
- `pending` → `completed` (must go through `processing`)
- `pending` → `published` (must complete upload first)

---

## Relationships

### User → VideoUpload

**Type**: One-to-Many  
**Cardinality**: One User can have many VideoUploads  
**Foreign Key**: `VideoUpload.clerkId` references `User.clerkId`  
**Cascade Behavior**: Deleting a User should cascade delete all their VideoUploads (soft delete recommended)

```typescript
// Example query: Get all videos for a user
const userVideos = await VideoUpload.find({ clerkId: user.clerkId })
  .sort({ createdAt: -1 })
  .limit(20);
```

### VideoUpload → Cloudinary Asset

**Type**: Reference (external system)  
**Cardinality**: One VideoUpload references one Cloudinary video asset  
**Foreign Key**: `VideoUpload.publicId` references Cloudinary public_id  
**Cascade Behavior**: Deleting VideoUpload may optionally delete Cloudinary asset (configurable)

---

## Validation Constraints Summary

### Frontend Validation (Before Upload)

| Constraint | Limit | Error Message |
|------------|-------|---------------|
| File Type | mp4, mov, avi | "Unsupported file format. Please upload MP4, MOV, or AVI files." |
| File Size | < 50MB (52428800 bytes) | "File size exceeds limit. Maximum size is 50MB." |
| Resource Type | video only | (Widget filters automatically) |

### Backend Validation (Post-Upload)

| Constraint | Limit | Error Message |
|------------|-------|---------------|
| Duration | ≤ 60 seconds | "Video duration exceeds limit. Maximum duration is 60 seconds." |
| Cloudinary URL | Valid HTTPS URL | "Invalid Cloudinary URL received." |
| Clerk ID | Valid, exists in User collection | "User not found. Please sign in again." |

### Database Validation (Mongoose Schema)

```typescript
const videoUploadSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    index: true,
    validate: {
      validator: async (clerkId: string) => {
        const user = await User.findOne({ clerkId });
        return user !== null;
      },
      message: 'Invalid Clerk ID - user must exist'
    }
  },
  cloudinaryUrl: {
    type: String,
    required: true,
    validate: {
      validator: (url: string) => /^https:\/\/res\.cloudinary\.com\/.+$/.test(url),
      message: 'Invalid Cloudinary URL format'
    }
  },
  fileSize: {
    type: Number,
    required: true,
    min: 1,
    max: 52428800
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
    max: 60
  },
  format: {
    type: String,
    required: true,
    enum: ['mp4', 'mov', 'avi']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'published'],
    default: 'pending'
  },
  // ... other fields
});
```

---

## Sample Documents

### User Document (with YouTube Credentials)

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439011')",
  "clerkId": "user_2abc123xyz",
  "email": "creator@example.com",
  "youtubeCredentials": {
    "accessToken": "ya29.a0AfH6SMBx...encrypted...xyz123",
    "refreshToken": "1//0gABC123...encrypted...xyz789",
    "tokenExpiry": "ISODate('2026-03-10T15:30:00.000Z')",
    "channelId": "UCxyz123abc"
  },
  "createdAt": "ISODate('2026-01-15T10:00:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:30:00.000Z')"
}
```

### VideoUpload Document (Completed)

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439012')",
  "clerkId": "user_2abc123xyz",
  "cloudinaryUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/abc123.mp4",
  "publicId": "goviral/videos/abc123xyz",
  "fileSize": 15728640,
  "duration": 45.5,
  "format": "mp4",
  "status": "completed",
  "agentServiceNotified": true,
  "youtubePublishAttempted": false,
  "metadata": {
    "resourceType": "video",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.7777777777777777,
    "tags": ["goviral", "short-form"],
    "originalFilename": "my_video.mp4"
  },
  "createdAt": "ISODate('2026-03-10T14:00:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:05:00.000Z')"
}
```

### VideoUpload Document (Failed)

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439013')",
  "clerkId": "user_2abc123xyz",
  "cloudinaryUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/def456.mp4",
  "publicId": "goviral/videos/def456xyz",
  "fileSize": 5242880,
  "duration": 75.2,
  "format": "mp4",
  "status": "failed",
  "error": "Video duration exceeds limit. Maximum duration is 60 seconds.",
  "agentServiceNotified": false,
  "youtubePublishAttempted": false,
  "createdAt": "ISODate('2026-03-10T14:10:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:11:00.000Z')"
}
```

---

## Data Access Patterns

### Common Queries

1. **Get user's videos**:
   ```typescript
   VideoUpload.find({ clerkId }).sort({ createdAt: -1 }).limit(20)
   ```

2. **Get video by ID**:
   ```typescript
   VideoUpload.findById(videoId)
   ```

3. **Get videos pending agent notification**:
   ```typescript
   VideoUpload.find({ status: 'completed', agentServiceNotified: false })
   ```

4. **Check if user has YouTube credentials**:
   ```typescript
   User.findOne({ clerkId }, { youtubeCredentials: 1 })
   ```

5. **Get expired tokens for refresh**:
   ```typescript
   User.find({ 
     'youtubeCredentials.tokenExpiry': { $lt: new Date() },
     'youtubeCredentials.refreshToken': { $exists: true }
   })
   ```

---

**Status**: ✅ Complete  
**Ready for Implementation**: Yes
