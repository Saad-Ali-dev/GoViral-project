# Data Model: Video Upload Feature

**Feature**: 002-video-upload
**Date**: 2026-03-10
**Updated**: 2026-03-11
**Version**: 1.1.0

This document defines the data entities, relationships, validation rules, and state transitions for the video upload feature.

---

## Entity 1: User (Extended)

**Purpose**: Represents an authenticated user with YouTube OAuth credentials for video publishing.

**Collection**: `users` (existing, extended with YouTube credentials)

### Fields

| Field                 | Type     | Required | Description                                                        |
| --------------------- | -------- | -------- | ------------------------------------------------------------------ |
| `_id`                 | ObjectId | Yes      | MongoDB primary key                                                |
| `clerkId`             | String   | Yes      | Unique user identifier from Clerk authentication (indexed, unique) |
| `email`               | String   | Yes      | User email address (indexed, unique)                               |
| `youtubeAccessToken`  | String   | No       | Encrypted YouTube OAuth access token                               |
| `youtubeRefreshToken` | String   | No       | Encrypted YouTube OAuth refresh token                              |
| `youtubeTokenExpiry`  | Date     | No       | Access token expiration timestamp                                  |
| `channelId`           | String   | No       | YouTube channel identifier (populated after first upload)          |
| `createdAt`           | Date     | Yes      | Document creation timestamp                                        |
| `updatedAt`           | Date     | Yes      | Last update timestamp                                              |

### Indexes

```typescript
{
  clerkId: 1;
} // Unique index for fast user lookups
{
  email: 1;
} // Unique index for email lookups
```

### Validation Rules

1. **clerkId**: Must be unique, non-empty string from Clerk authentication
2. **youtubeAccessToken**: Stored encrypted when present
3. **youtubeRefreshToken**: Stored encrypted when present
4. **youtubeTokenExpiry**: Must be a valid Date when credentials exist

### Encryption Requirements

- YouTube credentials SHOULD be encrypted at rest using a secure encryption algorithm (e.g., AES-256-GCM)
- Encryption key stored in environment variable (`ENCRYPTION_KEY` or similar)
- Decryption only occurs when tokens are needed for API calls

---

## Entity 2: Video

**Purpose**: Represents a video upload with metadata, status tracking, and user association.

**Collection**: `videos` (new collection)

### Fields

| Field              | Type       | Required | Default   | Description                                            |
| ------------------ | ---------- | -------- | --------- | ------------------------------------------------------ |
| `_id`              | ObjectId   | Yes      | -         | MongoDB primary key                                    |
| `userId`           | String     | Yes      | -         | Reference to User via Clerk ID (indexed)               |
| `originalFilename` | String     | No       | -         | Original filename from upload                          |
| `fileSize`         | Number     | Yes      | -         | File size in bytes                                     |
| `duration`         | Number     | Yes      | -         | Video duration in seconds                              |
| `status`           | String     | Yes      | 'pending' | Upload lifecycle status (see State Transitions)        |
| `error`            | String     | No       | -         | Error message if status is 'failed'                    |
| `cloudinaryUrl`    | String     | No       | -         | Secure URL from Cloudinary after upload                |
| `publicId`         | String     | Yes      | -         | Cloudinary public identifier for the video             |
| `thumbnailUrl`     | String     | No       | -         | Thumbnail image URL from Cloudinary                    |
| `aiResponse`       | AIResponse | No       | -         | AI-generated metadata (title, description, tags, etc.) |
| `metadata`         | Metadata   | No       | -         | Original video metadata (format, dimensions, tags, etc.) |
| `youtubeUrl`       | String     | No       | -         | YouTube video URL after publishing                     |
| `youtubeVideoId`   | String     | No       | -         | YouTube video ID after publishing                      |
| `createdAt`        | Date       | Yes      | -         | Upload initiation timestamp                            |
| `updatedAt`        | Date       | Yes      | -         | Last update timestamp                                  |

### Embedded Document: Metadata

| Field              | Type     | Required | Description                                     |
| ------------------ | -------- | -------- | ----------------------------------------------- |
| `originalFilename` | String   | No       | Original filename of the uploaded video         |
| `format`           | String   | No       | Video format: 'mp4', 'mov', 'avi', 'webm'       |
| `width`            | Number   | No       | Video width in pixels                           |
| `height`           | Number   | No       | Video height in pixels                          |
| `aspectRatio`      | Number   | No       | Video aspect ratio (width / height)             |
| `cloudinaryTags`   | String[] | No       | Auto-generated tags from Cloudinary analysis    |

### Embedded Document: AIResponse

| Field         | Type     | Required | Description                        |
| ------------- | -------- | -------- | ---------------------------------- |
| `title`       | String   | No       | AI-generated video title           |
| `description` | String   | No       | AI-generated video description     |
| `tags`        | String[] | No       | AI-generated tags/keywords         |
| `categoryId`  | Number   | No       | YouTube video category ID          |
| `viralScore`  | Number   | No       | AI-predicted viral potential score |

### Indexes

```typescript
{ userId: 1, createdAt: -1 }  // Composite index for user's videos sorted by date
{ status: 1 }                   // For querying videos by status
{ publicId: 1 }                 // Unique index for Cloudinary reference

```

### Validation Rules

1. **userId**: Must be non-empty string, corresponds to existing User.clerkId
2. **fileSize**: Must be positive integer, max 52428800 (50MB)
3. **duration**: Must be positive number, max 60 seconds
4. **status**: Must be one of: 'pending', 'processing', 'completed', 'failed', 'published'
5. **cloudinaryUrl**: Must be valid HTTPS URL from Cloudinary domain when present
6. **publicId**: Must be non-empty string, unique across collection
7. **error**: Required when status is 'failed'
8. **metadata.format**: Must be one of: 'mp4', 'mov', 'avi', 'webm' when present

### State Transitions

```
pending → processing → completed → published
                     ↓
                   failed
```

**Transition Rules**:

| From         | To           | Trigger                             | Validation                                   |
| ------------ | ------------ | ----------------------------------- | -------------------------------------------- |
| `pending`    | `processing` | Upload starts, security checks pass | File type, size validated                    |
| `processing` | `completed`  | Upload completes, metadata stored   | Duration ≤ 60s, all metadata present         |
| `processing` | `failed`     | Upload fails or validation fails    | Error message required                       |
| `completed`  | `published`  | Video published to YouTube          | YouTube credentials valid, API call succeeds |
| `completed`  | `failed`     | Post-upload validation fails        | Duration > 60s or other error                |

**Invalid Transitions**:

- `published` → any (terminal state)
- `failed` → any (terminal state, user must re-upload)
- `pending` → `completed` (must go through `processing`)
- `pending` → `published` (must complete upload first)

---

## Relationships

### User → Video

**Type**: One-to-Many
**Cardinality**: One User can have many Videos
**Foreign Key**: `Video.userId` references `User.clerkId`
**Cascade Behavior**: Deleting a User should cascade delete all their Videos (soft delete recommended)

```typescript
// Example query: Get all videos for a user
const userVideos = await Video.find({ userId: user.clerkId })
  .sort({ createdAt: -1 })
  .limit(20);
```

### Video → Cloudinary Asset

**Type**: Reference (external system)
**Cardinality**: One Video references one Cloudinary video asset
**Foreign Key**: `Video.cloudinaryUrl` references Cloudinary URL
**Cascade Behavior**: Deleting Video may optionally delete Cloudinary asset (configurable)

---

## Validation Constraints Summary

### Frontend Validation (Before Upload)

| Constraint    | Limit                   | Error Message                                                         |
| ------------- | ----------------------- | --------------------------------------------------------------------- |
| File Type     | mp4, mov, avi, webm     | "Unsupported file format. Please upload MP4, MOV, AVI or WebM files." |
| File Size     | < 50MB (52428800 bytes) | "File size exceeds limit. Maximum size is 50MB."                      |
| Resource Type | video only              | (Widget filters automatically)                                        |

### Backend Validation (Post-Upload)

| Constraint     | Limit                            | Error Message                                                   |
| -------------- | -------------------------------- | --------------------------------------------------------------- |
| Duration       | ≤ 60 seconds                     | "Video duration exceeds limit. Maximum duration is 60 seconds." |
| Cloudinary URL | Valid HTTPS URL                  | "Invalid Cloudinary URL received."                              |
| User ID        | Valid, exists in User collection | "User not found. Please sign in again."                         |

### Database Validation (Mongoose Schema)

```typescript
const videoSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  fileSize: {
    type: Number,
    required: true,
    min: 1,
    max: 52428800,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
    max: 60,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "completed", "failed", "published"],
    default: "pending",
  },
  cloudinaryUrl: {
    type: String,
    validate: {
      validator: (url: string) =>
        /^https:\/\/res\.cloudinary\.com\/.+$/.test(url),
      message: "Invalid Cloudinary URL format",
    },
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
  "youtubeAccessToken": "ya29.a0AfH6SMBx...encrypted...xyz123",
  "youtubeRefreshToken": "1//0gABC123...encrypted...xyz789",
  "youtubeTokenExpiry": "ISODate('2026-03-10T15:30:00.000Z')",
  "channelId": "UCxyz123abc",
  "createdAt": "ISODate('2026-01-15T10:00:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:30:00.000Z')"
}
```

### Video Document (Completed)

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439012')",
  "userId": "user_2abc123xyz",
  "originalFilename": "my_video.mp4",
  "fileSize": 15728640,
  "duration": 45.5,
  "status": "completed",
  "publicId": "abc123",
  "cloudinaryUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/abc123.mp4",
  "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/abc123.jpg",
  "metadata": {
    "originalFilename": "my_video.mp4",
    "format": "mp4",
    "width": 1080,
    "height": 1920,
    "aspectRatio": 0.5625,
    "cloudinaryTags": ["vertical", "portrait", "indoor"]
  },
  "aiResponse": {
    "title": "Amazing Short Video!",
    "description": "Check out this amazing short-form video optimized for YouTube",
    "tags": ["shorts", "viral", "trending"],
    "categoryId": 24,
    "viralScore": 85
  },
  "createdAt": "ISODate('2026-03-10T14:00:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:05:00.000Z')"
}
```

### Video Document (Failed)

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439013')",
  "userId": "user_2abc123xyz",
  "originalFilename": "too_long.mp4",
  "fileSize": 5242880,
  "duration": 75.2,
  "status": "failed",
  "publicId": "xyz789",
  "error": "Video duration exceeds limit. Maximum duration is 60 seconds.",
  "metadata": {
    "originalFilename": "too_long.mp4",
    "format": "mp4",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.778,
    "cloudinaryTags": ["landscape", "outdoor"]
  },
  "createdAt": "ISODate('2026-03-10T14:10:00.000Z')",
  "updatedAt": "ISODate('2026-03-10T14:11:00.000Z')"
}
```

---

## Data Access Patterns

### Common Queries

1. **Get user's videos**:

   ```typescript
   Video.find({ userId }).sort({ createdAt: -1 }).limit(20);
   ```

2. **Get video by ID**:

   ```typescript
   Video.findById(videoId);
   ```

3. **Get videos pending AI processing**:

   ```typescript
   Video.find({ status: "completed", aiResponse: { $exists: false } });
   ```

4. **Check if user has YouTube credentials**:

   ```typescript
   User.findOne({ clerkId }, { youtubeAccessToken: 1, youtubeTokenExpiry: 1 });
   ```

5. **Get expired tokens for refresh**:
   ```typescript
   User.find({
     youtubeTokenExpiry: { $lt: new Date() },
     youtubeRefreshToken: { $exists: true },
   });
   ```

---

**Status**: ✅ Complete
**Ready for Implementation**: Yes
