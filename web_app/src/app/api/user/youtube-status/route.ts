import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { User } from "../../../../models/User"
import dbConnect from "../../../../lib/db"
import { isTokenExpired } from "../../../../lib/youtube-oauth"

/**
 * GET /api/user/youtube-status
 * Checks if user has a valid YouTube connection
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get user's YouTube credentials
    const user = await User.findOne(
      { clerkId: userId },
      {
        youtubeAccessToken: 1,
        youtubeRefreshToken: 1,
        youtubeTokenExpiry: 1,
        channelId: 1,
      },
    )

    // Check if user has valid YouTube connection
    let isConnected = false
    let channelId = null

    if (
      user?.youtubeAccessToken &&
      user.youtubeTokenExpiry &&
      !isTokenExpired(user.youtubeTokenExpiry)
    ) {
      isConnected = true
      channelId = user.channelId || null
    }

    return NextResponse.json({
      isConnected,
      channelId,
    })
  } catch (error) {
    console.error("YouTube status check error:", error)
    return NextResponse.json(
      { error: "Failed to check YouTube connection status" },
      { status: 500 },
    )
  }
}
