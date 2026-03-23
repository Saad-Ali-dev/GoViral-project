import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Video } from "@/models/Video"
import dbConnect from "@/lib/db"

/**
 * GET /api/videos/[id]
 * Retrieves a single video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get video ID from params
    const { id } = await params

    // Connect to database
    await dbConnect()

    // Get video
    const video = await Video.findOne({
      _id: id,
      userId,
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Get video error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve video" },
      { status: 500 },
    )
  }
}
