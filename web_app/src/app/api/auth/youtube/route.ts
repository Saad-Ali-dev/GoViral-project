import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { generateYouTubeAuthUrl } from "@/lib/youtube-oauth"
import { User } from "@/models/User"
import dbConnect from "@/lib/db"

/**
 * GET /api/auth/youtube
 * Initiates YouTube OAuth flow for connecting user's YouTube account
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await getAuth(request as any)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has valid YouTube credentials
    await dbConnect()
    const user = await User.findOne(
      { clerkId: auth.userId },
      { youtubeAccessToken: 1, youtubeTokenExpiry: 1 },
    )

    if (user?.youtubeAccessToken) {
      const now = new Date()
      if (
        user.youtubeTokenExpiry &&
        user.youtubeTokenExpiry > now
      ) {
        // Token still valid, redirect to upload
        return NextResponse.redirect(new URL("/upload", request.url))
      }
    }

    // Generate OAuth URL
    const authUrl = generateYouTubeAuthUrl()

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("YouTube OAuth initiation error:", error)
    return NextResponse.json(
      { error: "Failed to initiate YouTube OAuth" },
      { status: 500 },
    )
  }
}
