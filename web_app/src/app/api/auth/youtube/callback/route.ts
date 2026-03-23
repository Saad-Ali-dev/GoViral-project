import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { exchangeCodeForTokens, encrypt } from "@/lib/youtube-oauth"
import { User } from "@/models/User"
import dbConnect from "@/lib/db"

/**
 * GET /api/auth/youtube/callback
 * Handles OAuth callback from Google after user authorization
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")
  const code = searchParams.get("code")

  // Handle user denial or error
  if (error) {
    const redirectUrl = new URL("/upload", request.url)
    redirectUrl.searchParams.set("error", "youtube_oauth_denied")
    redirectUrl.searchParams.set(
      "message",
      "YouTube authorization required to upload videos. Please try again.",
    )
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    )
  }

  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Missing tokens in response")
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = encrypt(tokens.refresh_token)

    // Store in database
    await dbConnect()
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        youtubeAccessToken: encryptedAccessToken,
        youtubeRefreshToken: encryptedRefreshToken,
        youtubeTokenExpiry: new Date(tokens.expiry_date!),
        channelId: tokens.channel_id,
      },
      { upsert: true },
    )

    // Redirect to upload page
    return NextResponse.redirect(new URL("/upload", request.url))
  } catch (error) {
    console.error("YouTube OAuth callback error:", error)
    const redirectUrl = new URL("/upload", request.url)
    redirectUrl.searchParams.set("error", "youtube_oauth_failed")
    redirectUrl.searchParams.set(
      "message",
      "Unable to complete YouTube authorization. Please try again.",
    )
    return NextResponse.redirect(redirectUrl)
  }
}
