import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Video } from "@/models/Video"
import dbConnect from "@/lib/db"
import axios from "axios"

/**
 * POST /api/videos
 * Stores video metadata after successful Cloudinary upload
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      cloudinaryUrl,
      publicId,
      size,
      duration,
      originalFilename,
      thumbnailUrl,
      width,
      height,
    } = body

    // Validate required fields
    if (!cloudinaryUrl || !publicId || !size || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // Validate duration (post-upload check)
    if (duration > 60) {
      return NextResponse.json(
        {
          error:
            "Video duration exceeds limit. Maximum duration is 60 seconds.",
        },
        { status: 400 },
      )
    }

    // Connect to database
    await dbConnect()

    // Create video document with "processing" status
    const video = await Video.create({
      userId,
      cloudinaryUrl,
      publicId,
      size,
      duration,
      originalFilename,
      thumbnailUrl,
      status: "processing",
      metadata: {
        resourceType: "video",
        originalFilename,
        width,
        height,
        aspectRatio: width && height ? width / height : undefined,
      },
    })

    // Call agent service to process video
    const agentServiceUrl =
      process.env.AGENT_SERVICE_URL || "http://localhost:8000"

    try {
      const response = await axios.post(
        `${agentServiceUrl}/api/videos/process`,
        {
          cloudinary_url: cloudinaryUrl,
          video_id: video._id.toString(),
          user_id: userId,
          public_id: publicId,
        },
        { timeout: 30000 }
      )

      console.log("Agent service response:", response.data)

      video.agentServiceNotified = true
      await video.save()
    } catch (agentError: any) {
      console.error("Agent service notification failed:", agentError?.message || agentError)
      // Don't fail the upload - agent service is async
    }

    return NextResponse.json(
      {
        ...video.toObject(),
        redirectTo: `/processing?video_id=${video._id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Video metadata storage error:", error)
    return NextResponse.json(
      { error: "Failed to store video metadata" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/videos
 * Retrieves user's uploaded videos
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")

    // Connect to database
    await dbConnect()

    // Build query
    const query: any = { userId }
    if (status) {
      query.status = status
    }

    // Get videos
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Get videos error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve videos" },
      { status: 500 },
    )
  }
}
