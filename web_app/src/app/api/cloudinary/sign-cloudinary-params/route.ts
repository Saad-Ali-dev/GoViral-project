import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { signCloudinaryParams } from "@/lib/cloudinary"

/**
 * POST /api/cloudinary/sign-cloudinary-params
 * Signs Cloudinary upload parameters for secure client-side uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { paramsToSign } = await request.json()

    if (!paramsToSign) {
      return NextResponse.json(
        { error: "Missing paramsToSign" },
        { status: 400 },
      )
    }

    // Generate signature
    const signature = signCloudinaryParams(paramsToSign)

    return NextResponse.json(signature)
  } catch (error) {
    console.error("Cloudinary signing error:", error)
    return NextResponse.json(
      { error: "Failed to sign Cloudinary parameters" },
      { status: 500 },
    )
  }
}
