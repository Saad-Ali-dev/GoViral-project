import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
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
    const auth = await getAuth(request as any)
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get video ID from params
    const { id } = await params

    // Connect to database
    await dbConnect()

    // Get video
    const video = await Video.findOne({
      _id: id,
      userId: auth.userId,
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
