# Quickstart Guide: Video Upload Feature

**Feature**: 002-video-upload
**Date**: 2026-03-10
**Updated**: 2026-03-11
**Version**: 1.1.0

⚠️ **YOUTUBE FEATURES REMOVED** — YouTube OAuth, channel access, YouTube upload, YouTube connection checks, and YouTube Data API integration have been permanently removed from this project. This file is preserved for historical reference only.

This guide provides step-by-step implementation instructions for the video upload feature with YouTube OAuth and Cloudinary integration.

---

## Prerequisites

1. **Node.js**: v18+ installed
2. **MongoDB**: Connection string in `MONGODB_URI`
3. **Cloudinary Account**: With upload preset 'GoViral-Video' configured
4. REMOVED: YouTube feature - **Google Cloud Console**: OAuth 2.0 credentials configured
5. **Clerk Authentication**: Set up in the project

---

## Step 1: Install Dependencies

```bash
cd web_app
npm install next-cloudinary

**Note**: google-auth-library dependency has been removed (YouTube OAuth removed). All other dependencies (axios, mongoose, etc.) are already in the project.

---

## Step 2: Configure Environment Variables

Ensure the following environment variables are set in `.env.local`:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database
MONGODB_URI=mongodb+srv://...

# Optional: Agent Service URL (defaults to dummy URL)
AGENT_SERVICE_URL=http://localhost:8000/api/dummy-agent
```

---

## Step 3: Create Cloudinary Configuration

**File**: `web_app/lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export function signCloudinaryParams(paramsToSign: Record<string, any>) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );
  
  return {
    signature,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    timestamp: paramsToSign.timestamp,
  };
}
```

---

REMOVED: YouTube feature
## Step 4: Create YouTube OAuth Utilities

This step has been removed. The file `web_app/lib/youtube-oauth.ts` and all OAuth-related code (google-auth-library, encryption/decryption of tokens, token expiry checks) is no longer part of the project.

---

## Step 5: Create VideoUpload Model

**File**: `web_app/models/Video.ts`

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideoUpload extends Document {
  clerkId: string;
  cloudinaryUrl: string;
  publicId: string;
  fileSize: number;
  duration: number;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'published';
  error?: string;
  agentServiceNotified: boolean;
  youtubePublishAttempted: boolean;
  youtubeVideoId?: string;
  metadata?: {
    resourceType?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    tags?: string[];
    originalFilename?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VideoUploadSchema: Schema<IVideoUpload> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
      validate: {
        validator: (url: string) => /^https:\/\/res\.cloudinary\.com\/.+$/.test(url),
        message: 'Invalid Cloudinary URL format',
      },
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
      max: 52428800, // 50MB
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },
    format: {
      type: String,
      required: true,
      enum: ['mp4', 'mov', 'avi'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'published'],
      default: 'pending',
    },
    error: {
      type: String,
    },
    agentServiceNotified: {
      type: Boolean,
      default: false,
    },
    // REMOVED: YouTube feature - youtubePublishAttempted and youtubeVideoId fields removed
    metadata: {
      resourceType: String,
      width: Number,
      height: Number,
      aspectRatio: Number,
      tags: [String],
      originalFilename: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VideoUploadSchema.index({ clerkId: 1, createdAt: -1 });

const VideoUpload: Model<IVideoUpload> =
  mongoose.models.VideoUpload || mongoose.model<IVideoUpload>('VideoUpload', VideoUploadSchema);

export default VideoUpload;
```

---

REMOVED: YouTube feature
## Step 6: Extend User Model with YouTube Credentials

This step has been removed. No YouTube credential fields exist in the User model.

---

REMOVED: YouTube feature
## Step 7: Create YouTube OAuth API Routes

This step has been removed. The files `web_app/app/api/auth/youtube/route.ts` and `web_app/app/api/auth/youtube/callback/route.ts` no longer exist in the project.

---

## Step 8: Create Cloudinary Signing Route

**File**: `web_app/app/api/cloudinary/sign-cloudinary-params/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { signCloudinaryParams } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { paramsToSign } = await request.json();

    if (!paramsToSign) {
      return NextResponse.json({ error: 'Missing paramsToSign' }, { status: 400 });
    }

    // Generate signature
    const signature = signCloudinaryParams(paramsToSign);

    return NextResponse.json(signature);
  } catch (error) {
    console.error('Cloudinary signing error:', error);
    return NextResponse.json(
      { error: 'Failed to sign Cloudinary parameters' },
      { status: 500 }
    );
  }
}
```

---

## Step 9: Create Video Metadata Storage Route

**File**: `web_app/app/api/videos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import VideoUpload from '@/models/Video';
import { connectToDatabase } from '@/lib/db';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      cloudinaryUrl,
      publicId,
      fileSize,
      duration,
      format,
      originalFilename,
      width,
      height,
    } = body;

    // Validate required fields
    if (!cloudinaryUrl || !publicId || !fileSize || !duration || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration > 60) {
      return NextResponse.json(
        { error: 'Video duration exceeds limit. Maximum duration is 60 seconds.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create video upload document
    const videoUpload = await VideoUpload.create({
      clerkId: userId,
      cloudinaryUrl,
      publicId,
      fileSize,
      duration,
      format,
      status: 'completed',
      metadata: {
        resourceType: 'video',
        originalFilename,
        width,
        height,
        aspectRatio: width && height ? width / height : undefined,
      },
    });

    // Notify agent service (dummy URL for now)
    const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000/api/dummy-agent';
    
    try {
      await axios.post(agentServiceUrl, {
        videoId: videoUpload._id.toString(),
        clerkId: videoUpload.clerkId,
        cloudinaryUrl: videoUpload.cloudinaryUrl,
        duration: videoUpload.duration,
        fileSize: videoUpload.fileSize,
        format: videoUpload.format,
      });
      
      videoUpload.agentServiceNotified = true;
      await videoUpload.save();
    } catch (agentError) {
      console.error('Agent service notification failed:', agentError);
      // Don't fail the upload - agent service is async
    }

    return NextResponse.json(videoUpload, { status: 201 });
  } catch (error) {
    console.error('Video metadata storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store video metadata' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: any = { clerkId: userId };
    if (status) {
      query.status = status;
    }

    // Get videos
    const videos = await VideoUpload.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve videos' },
      { status: 500 }
    );
  }
}
```

---

## Step 10: Create Upload Page Component

**File**: `web_app/app/upload/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function UploadPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle OAuth error from query params
  if (searchParams.get('error')) {
    // Error is already handled by callback route
    // You can show a toast/notification here
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to upload videos</h1>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Upload Video</h1>
          <p className="text-gray-600 text-center mb-8">
            Upload short-form videos (max 60 seconds, max 50MB)
          </p>

          {/* Error Message */}
          {searchParams.get('error') && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{searchParams.get('message')}</p>
            </div>
          )}

          {/* Upload Widget */}
          <div className="flex justify-center">
            <CldUploadWidget
              signatureEndpoint="/api/cloudinary/sign-cloudinary-params"
              uploadPreset="GoViral-Video"
              options={{
                sources: ['local', 'camera', 'url'],
                maxFiles: 1,
                resourceType: 'video',
                clientAllowedFormats: ['mp4', 'mov', 'avi'],
                maxFileSize: 52428800, // 50MB
                folder: 'goviral/videos',
              }}
              onProgress={(result, { widget }) => {
                const { loaded, total } = result.event || {};
                if (loaded && total) {
                  setUploadProgress(Math.round((loaded / total) * 100));
                }
                setIsUploading(true);
                setUploadStatus('uploading');
              }}
              onUploadAdded={() => {
                setIsUploading(true);
                setUploadStatus('uploading');
              }}
              onSuccess={async (result, { widget }) => {
                try {
                  const info = result.info as any;
                  
                  // Validate duration
                  if (info.duration && info.duration > 60) {
                    setErrorMessage('Video duration exceeds limit. Maximum duration is 60 seconds.');
                    setUploadStatus('error');
                    widget.close();
                    return;
                  }

                  // Store metadata in backend
                  const response = await axios.post('/api/videos', {
                    cloudinaryUrl: info.secure_url,
                    publicId: info.public_id,
                    fileSize: info.bytes,
                    duration: info.duration,
                    format: info.format,
                    originalFilename: info.original_filename,
                    width: info.width,
                    height: info.height,
                  });

                  if (response.status === 201) {
                    setUploadStatus('success');
                    setUploadProgress(100);
                  }
                } catch (error: any) {
                  console.error('Upload error:', error);
                  setErrorMessage(
                    error.response?.data?.error || 'Failed to save video metadata. Please try again.'
                  );
                  setUploadStatus('error');
                } finally {
                  setIsUploading(false);
                  widget.close();
                }
              }}
              onError={(error, { widget }) => {
                console.error('Upload error:', error);
                setErrorMessage('Upload failed. Please try again.');
                setUploadStatus('error');
                setIsUploading(false);
                widget.close();
              }}
            >
              {({ open }) => (
                <div className="w-full">
                  <button
                    onClick={() => open()}
                    disabled={isUploading}
                    className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {isUploading ? 'Uploading...' : 'Select Video'}
                  </button>
                </div>
              )}
            </CldUploadWidget>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-gray-600 mt-2">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-semibold">
                Video uploaded successfully! Agent processing has started.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errorMessage}</p>
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setErrorMessage('');
                  setUploadProgress(0);
                }}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Guidelines */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-2">Video Requirements</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Format: MP4, MOV, or AVI</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Maximum duration: 60 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 11: Update Homepage Upload Button

**File**: `web_app/app/page.tsx` (or wherever the upload button is)

```typescript
import { getAuth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Check if user is signed in
  const userId = getAuth(); // Adjust based on your auth setup
  
  const handleUploadClick = () => {
    if (!userId) {
      redirect('/sign-in');
    } else {
      redirect('/upload');
    }
  };

  return (
    // ... existing homepage code
    <button onClick={handleUploadClick}>
      Upload Video
    </button>
    // ...
  );
}
```

---

## Step 12: Add SEO Metadata to Upload Page

**File**: `web_app/src/app/upload/page.tsx`

Add comprehensive SEO metadata using Next.js 16 Metadata API:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Video - GoViral | AI-Powered YouTube SEO Optimization',
  description: 'Upload your short-form videos to GoViral for AI-powered SEO optimization. Automatically generate titles, descriptions, tags, and thumbnails for YouTube.',
  keywords: [
    'video upload',
    'YouTube SEO',
    'AI optimization',
    'short-form video',
    'content creator tools',
    'video marketing',
    'YouTube shorts',
  ],
  authors: [{ name: 'GoViral Team' }],
  openGraph: {
    title: 'Upload Video - GoViral',
    description: 'AI-powered YouTube SEO optimization for short-form videos',
    type: 'website',
    locale: 'en_US',
    siteName: 'GoViral',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GoViral - AI-Powered YouTube SEO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upload Video - GoViral',
    description: 'AI-powered YouTube SEO optimization',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

---

REMOVED: YouTube feature
## Step 13: Create Connect YouTube Button Component

This step has been removed. The `ConnectYouTubeButton` component no longer exists in the project.

---

REMOVED: YouTube feature
## Step 14: Add YouTube Status Check API Route

This step has been removed. The `youtube-status` endpoint no longer exists in the project.

---

REMOVED: YouTube feature
## Step 15: Integrate Connect YouTube Button into Navbar/Sidebar

This step has been removed. No YouTube connection UI exists in the Navbar/Sidebar.

---

## Step 16: Test the Implementation

### Test Checklist

1. REMOVED: YouTube feature - **OAuth Flow** section removed

2. **Upload Flow**:
   - [ ] Upload widget opens and allows file selection
   - [ ] File type validation works (only mp4, mov, avi)
   - [ ] File size validation works (max 50MB)
   - [ ] Progress bar shows upload percentage
   - [ ] Duration validation rejects videos > 60s
   - [ ] Metadata is stored in database
   - [ ] Agent service is notified (dummy URL)

3. REMOVED: YouTube feature - **Connect YouTube Button** section removed

4. **SEO Optimization**:
   - [ ] Upload page has correct title and description
   - [ ] Open Graph tags present and correct
   - [ ] Twitter Card tags present
   - [ ] Page is indexable by search engines

5. **Error Handling**:
   - [ ] OAuth denial shows appropriate error
   - [ ] Invalid file type shows error
   - [ ] File too large shows error
   - [ ] Video too long shows error
   - [ ] Network errors are handled gracefully

6. **No State Persistence**:
   - [ ] Upload cancels when user navigates away
   - [ ] No upload state in localStorage/sessionStorage
   - [ ] Fresh upload starts when user returns

---

## Troubleshooting

REMOVED: YouTube feature
### OAuth Callback Returns Error

---

### Cloudinary Upload Fails

**Problem**: Upload widget shows error

**Solutions**:
1. Verify Cloudinary credentials in environment variables
2. Check that upload preset 'GoViral-Video' exists
3. Verify signing endpoint returns correct signature

### Duration Validation Not Working

**Problem**: Videos > 60s are accepted

**Solutions**:
1. Check `onSuccess` handler validates duration
2. Verify Cloudinary returns duration in metadata
3. Add server-side validation in `/api/videos` route

REMOVED: YouTube feature
### Connect YouTube Button Not Showing

---

## Next Steps

After completing this implementation:

1. **Manual Testing**: Test all user scenarios from spec.md
2. **UI Polish**: Add animations, improve loading states
3. **Error Messages**: Localize and improve error messages
4. **Analytics**: Add tracking for upload events
5. **Agent Service**: Replace dummy URL with actual agent service endpoint

---

**Status**: ✅ Complete
**Ready for Implementation**: Yes
