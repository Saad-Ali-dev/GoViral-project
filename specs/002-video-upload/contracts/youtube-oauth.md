# YouTube OAuth 2.0 Flow Contract

**Feature**: 002-video-upload  
**Date**: 2026-03-10  
**Version**: 1.0.0

This document defines the YouTube OAuth 2.0 authorization flow for the GoViral application.

---

## Overview

GoViral uses Google OAuth 2.0 to obtain authorization from users to upload videos to YouTube on their behalf. The flow uses the **authorization code grant** with **offline access** to obtain long-lived refresh tokens.

---

## OAuth Configuration

### Required Scopes

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/youtube.upload` | Upload videos to YouTube |
| `https://www.googleapis.com/auth/youtube` | Manage YouTube account data |

### Redirect URI

- **Development**: `http://localhost:3000/api/auth/youtube/callback`
- **Production**: `https://goviral.vercel.app/api/auth/youtube/callback`

**Note**: Redirect URI must be registered in Google Cloud Console under Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs.

### Environment Variables

```env
NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_YOUTUBE_CLIENT_SECRET=your_client_secret
```

---

## Flow Sequence

### Sequence 1: Initial OAuth Authorization

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  User   │         │ GoViral │         │  Google │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │ 1. Click Upload   │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ 2. Check YouTube  │                   │
     │                   │    credentials in │                   │
     │                   │    DB             │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ 3. No credentials │                   │
     │                   │    found          │                   │
     │                   │<──────────────────│                   │
     │                   │                   │                   │
     │                   │ 4. Generate OAuth │                   │
     │                   │    URL with scopes│                   │
     │                   │                   │                   │
     │ 5. Redirect to    │                   │                   │
     │    Google OAuth   │                   │                   │
     │<──────────────────│                   │                   │
     │                   │                   │                   │
     │ 6. Navigate to    │                   │                   │
     │    Google consent │                   │                   │
     │   screen----------│------------------>│                   │
     │                   │                   │                   │
     │                   │ 7. User logs in   │                   │
     │                   │    and grants     │                   │
     │                   │    permission     │                   │
     │                   │                   │                   │
     │ 8. Redirect with  │                   │                   │
     │    auth code      │                   │                   │
     │<──────────────────│───────────────────│                   │
     │                   │                   │                   │
     │ 9. Navigate to    │                   │                   │
     │    callback URL   │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ 10. Exchange code │                   │
     │                   │     for tokens    │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ 11. Return tokens │                   │
     │                   │     (access,      │                   │
     │                   │      refresh)     │                   │
     │                   │<──────────────────│                   │
     │                   │                   │                   │
     │                   │ 12. Encrypt and   │                   │
     │                   │     store tokens  │                   │
     │                   │──────────────────────────────────────>│
     │                   │                   │                   │
     │                   │ 13. Tokens stored │                   │
     │                   │<──────────────────────────────────────│
     │                   │                   │                   │
     │ 14. Redirect to   │                   │                   │
     │     /upload       │                   │                   │
     │<──────────────────│                   │                   │
     │                   │                   │                   │
```

### Sequence 2: Token Refresh (Automatic)

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  User   │         │ GoViral │         │  Google │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │ 1. Initiate       │                   │                   │
     │    upload         │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │ 2. Check token    │                   │
     │                   │    expiry         │                   │
     │                   │──────────────────────────────────────>│
     │                   │                   │                   │
     │                   │ 3. Token expired  │                   │
     │                   │<──────────────────────────────────────│
     │                   │                   │                   │
     │                   │ 4. Use refresh    │                   │
     │                   │    token to get   │                   │
     │                   │    new access     │                   │
     │                   │    token          │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │ 5. Return new     │                   │
     │                   │    access token   │                   │
     │                   │<──────────────────│                   │
     │                   │                   │                   │
     │                   │ 6. Update tokens  │                   │
     │                   │    in DB          │                   │
     │                   │──────────────────────────────────────>│
     │                   │                   │                   │
     │                   │ 7. Proceed with   │                   │
     │                   │    upload         │                   │
     │                   │                   │                   │
```

---

## API Endpoint Details

### POST /api/auth/youtube

**Purpose**: Initiate YouTube OAuth flow

**Request**:
- Method: GET (redirect) or POST (returns URL)
- Authentication: Required (Clerk)
- Headers: `Authorization: Bearer <clerk_token>`

**Response** (GET):
- Status: `302 Found`
- Header: `Location: https://accounts.google.com/o/oauth2/v2/auth?...`

**Response** (POST):
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&response_type=code&access_type=offline&prompt=consent"
}
```

**OAuth URL Parameters**:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `client_id` | `NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID` | Application identifier |
| `redirect_uri` | `http://localhost:3000/api/auth/youtube/callback` | Callback URL |
| `scope` | `https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube` | Required permissions |
| `response_type` | `code` | Authorization code flow |
| `access_type` | `offline` | Request refresh token |
| `prompt` | `consent` | Force consent screen (ensures refresh token) |
| `state` | Random string | CSRF protection (recommended) |

---

### GET /api/auth/youtube/callback

**Purpose**: Handle OAuth callback from Google

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes* | Authorization code from Google |
| `error` | string | No* | Error if user denied consent |
| `state` | string | No | State parameter for CSRF validation |

*Either `code` or `error` will be present

**Success Flow**:

1. Extract `code` from query parameters
2. Exchange code for tokens using `oauth2Client.getToken(code)`
3. Encrypt tokens (access token, refresh token)
4. Store in User document:
   ```typescript
   {
     youtubeCredentials: {
       accessToken: encrypt(tokens.access_token),
       refreshToken: encrypt(tokens.refresh_token),
       tokenExpiry: new Date(tokens.expiry_date),
       channelId: tokens.channel_id // if available
     }
   }
   ```
5. Redirect to `/upload`

**Error Flow**:

1. If `error` parameter present (user denied consent):
   - Redirect to `/upload?error=youtube_oauth_denied`
2. If token exchange fails:
   - Redirect to `/upload?error=youtube_oauth_failed`

**Response** (Success):
- Status: `302 Found`
- Header: `Location: /upload`

**Response** (Error - User Denied):
- Status: `302 Found`
- Header: `Location: /upload?error=youtube_oauth_denied&message=YouTube%20authorization%20required%20to%20upload%20videos.%20Please%20try%20again.`

---

## Token Storage & Encryption

### Encryption Requirements

YouTube credentials MUST be encrypted at rest using AES-256-GCM or equivalent.

**Implementation Pattern**:
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Database Schema

```typescript
// User document
{
  clerkId: string;
  youtubeCredentials?: {
    accessToken: string;      // Encrypted
    refreshToken: string;     // Encrypted
    tokenExpiry: Date;
    channelId?: string;
  };
}
```

---

## Error Handling

### OAuth Error Scenarios

| Scenario | Error Code | User Message |
|----------|------------|--------------|
| User denies consent | `OAUTH_DENIED` | "YouTube authorization required to upload videos. Please try again." |
| Invalid authorization code | `OAUTH_INVALID_CODE` | "Unable to complete YouTube authorization. Please try again." |
| Network error during token exchange | `OAUTH_NETWORK_ERROR` | "Unable to connect to YouTube. Please try again." |
| Invalid credentials (client ID/secret) | `OAUTH_INVALID_CREDENTIALS` | "YouTube API configuration error. Please contact support." |
| Redirect URI mismatch | `OAUTH_REDIRECT_ERROR` | "YouTube OAuth configuration error. Please contact support." |
| Token refresh fails | `OAUTH_TOKEN_REFRESH_FAILED` | "YouTube session expired. Please authorize again." |

---

## Token Lifecycle Management

### Token Expiry

- **Access Token**: Typically expires after 1 hour
- **Refresh Token**: Long-lived (expires if unused for 6 months or if user revokes access)

### Automatic Refresh

Before any YouTube API call, check token expiry:

```typescript
async function getValidAccessToken(user: User): Promise<string> {
  if (!user.youtubeCredentials) {
    throw new Error('No YouTube credentials');
  }

  const now = new Date();
  const expiryBuffer = 5 * 60 * 1000; // 5 minutes buffer

  if (user.youtubeCredentials.tokenExpiry.getTime() - now.getTime() > expiryBuffer) {
    // Token still valid
    return decrypt(user.youtubeCredentials.accessToken);
  }

  // Token expired, refresh using refresh token
  const { tokens } = await oauth2Client.refreshToken(
    decrypt(user.youtubeCredentials.refreshToken)
  );

  // Update credentials in DB
  await User.findOneAndUpdate(
    { clerkId: user.clerkId },
    {
      youtubeCredentials: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token 
          ? encrypt(tokens.refresh_token) 
          : user.youtubeCredentials.refreshToken,
        tokenExpiry: new Date(tokens.expiry_date),
      }
    }
  );

  return tokens.access_token;
}
```

---

## Security Considerations

1. **State Parameter**: Use random state parameter to prevent CSRF attacks
2. **HTTPS Only**: Production redirect URIs must use HTTPS
3. **Token Encryption**: Never store tokens in plaintext
4. **Minimal Scopes**: Only request required scopes
5. **Secure Storage**: Use environment variables for client secrets
6. **Token Rotation**: Handle refresh token rotation gracefully
7. **Revocation Handling**: Detect and handle token revocation by user

---

## Testing Scenarios

### Test Case 1: First-Time OAuth

1. User has no YouTube credentials in DB
2. User initiates upload
3. System redirects to Google OAuth
4. User grants permission
5. Tokens stored in DB
6. User redirected to /upload

### Test Case 2: Existing Valid Token

1. User has valid (non-expired) access token
2. User initiates upload
3. System proceeds directly to /upload without OAuth

### Test Case 3: Expired Token with Valid Refresh

1. User has expired access token but valid refresh token
2. User initiates upload
3. System automatically refreshes access token
4. Upload proceeds

### Test Case 4: User Denies Consent

1. User redirected to Google OAuth
2. User clicks "Cancel" or denies permission
3. System shows error: "YouTube authorization required..."
4. User can retry

### Test Case 5: Revoked Access

1. User previously authorized, tokens stored
2. User revokes access in Google account settings
3. Next API call fails with 401
4. System re-triggers OAuth flow

---

**Status**: ✅ Complete  
**Ready for Implementation**: Yes
