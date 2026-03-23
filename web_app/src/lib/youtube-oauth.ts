import { OAuth2Client } from "google-auth-library"
import crypto from "crypto"

/**
 * Creates and returns a new OAuth2 client instance
 * @returns Configured OAuth2 client
 */
export function getOAuth2Client() {
  return new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_YOUTUBE_CLIENT_ID,
    process.env.GOOGLE_YOUTUBE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/youtube/callback",
  )
}

/**
 * Generates the YouTube OAuth authorization URL
 * @param state - Optional CSRF protection state parameter
 * @returns Authorization URL to redirect user to
 */
export function generateYouTubeAuthUrl(state?: string) {
  const oauth2Client = getOAuth2Client()

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
    ],
    prompt: "consent", // Force refresh token generation on first auth
    state, // Optional CSRF protection
  })

  return authUrl
}

/**
 * Exchanges authorization code for OAuth tokens
 * @param code - Authorization code from OAuth callback
 * @returns Token response from Google
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

/**
 * Refreshes an expired access token using the refresh token
 * @param refreshToken - Encrypted refresh token
 * @returns New access token and expiry
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    // Decrypt the refresh token
    const decryptedRefreshToken = decrypt(refreshToken)

    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken,
    })

    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken()

    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token")
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
    throw new Error("Failed to refresh YouTube access token")
  }
}

/**
 * Gets a valid access token, refreshing if necessary
 * @param encryptedAccessToken - Encrypted access token
 * @param encryptedRefreshToken - Encrypted refresh token
 * @param tokenExpiry - Token expiry date
 * @returns Valid access token
 */
export async function getValidAccessToken(
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  tokenExpiry: Date,
): Promise<string> {
  // Check if token is still valid (with 5-minute buffer)
  if (!isTokenExpired(tokenExpiry)) {
    // Token still valid, decrypt and return
    return decrypt(encryptedAccessToken)
  }

  // Token expired or expiring, refresh it
  const { accessToken } = await refreshAccessToken(encryptedRefreshToken)
  return accessToken
}

/**
 * Encryption key from environment or generated (for development only)
 * In production, always use a secure environment variable
 */
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
const IV_LENGTH = 16

/**
 * Encrypts text using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  )
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")
  return iv.toString("hex") + ":" + authTag + ":" + encrypted
}

/**
 * Decrypts encrypted text using AES-256-GCM
 * @param encrypted - Encrypted text in format iv:authTag:encryptedText
 * @returns Decrypted plain text
 */
export function decrypt(encrypted: string): string {
  const parts = encrypted.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const authTag = Buffer.from(parts[1], "hex")
  const encryptedText = parts[2]
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  )
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

/**
 * Checks if a token is expired (with 5-minute buffer)
 * @param expiryDate - Token expiry date
 * @returns True if token is expired or expiring soon
 */
export function isTokenExpired(expiryDate: Date): boolean {
  const now = new Date()
  const buffer = 5 * 60 * 1000 // 5 minutes
  return expiryDate.getTime() - now.getTime() < buffer
}

