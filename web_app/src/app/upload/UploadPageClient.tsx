"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { VideoUploadWidget } from "../../components/upload/VideoUploadWidget"
import { UploadProgress } from "../../components/upload/UploadProgress"
import { getUploadErrorMessage, UPLOAD_ERROR_MESSAGES } from "../../lib/error-messages"
import axios from "axios"

/**
 * Client-side upload page component
 * Handles video upload flow with progress tracking, error handling,
 * and YouTube OAuth verification
 */
export default function UploadPageClient() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [hasYouTubeConnection, setHasYouTubeConnection] = useState(false)
  const [checkingYouTube, setCheckingYouTube] = useState(true)

  // Check YouTube OAuth status on mount
  useEffect(() => {
    async function checkYouTubeStatus() {
      if (!isSignedIn) {
        setCheckingYouTube(false)
        return
      }

      try {
        const response = await axios.get("/api/user/youtube-status")
        setHasYouTubeConnection(response.data.isConnected)
      } catch (error) {
        console.error("Failed to check YouTube status:", error)
        // Don't block upload if status check fails
        setHasYouTubeConnection(false)
      } finally {
        setCheckingYouTube(false)
      }
    }

    checkYouTubeStatus()
  }, [isSignedIn])

  // Handle sign-in requirement
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Please sign in to upload videos
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in to access GoViral&apos;s AI-powered video optimization
          </p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const handleUploadStart = async () => {
    // Check YouTube connection before allowing upload
    if (!hasYouTubeConnection && !checkingYouTube) {
      setErrorMessage(UPLOAD_ERROR_MESSAGES.YOUTUBE_OAUTH_REQUIRED)
      setUploadStatus("error")
      return false // Prevent upload
    }
    return true // Allow upload
  }

  const handleUploadSuccess = async (result: any) => {
    try {
      const info = result.info as any

      console.log("Upload success:", {
        url: info.secure_url,
        publicId: info.public_id,
        duration: info.duration,
        size: info.bytes,
      })

      // Validate duration (post-upload check)
      if (info.duration && info.duration > 60) {
        setErrorMessage(
          UPLOAD_ERROR_MESSAGES.DURATION_EXCEEDS_LIMIT,
        )
        setUploadStatus("error")
        return
      }

      // Store metadata in backend
      const response = await axios.post("/api/videos", {
        cloudinaryUrl: info.secure_url,
        publicId: info.public_id,
        size: info.bytes,
        duration: info.duration,
        originalFilename: info.original_filename,
        thumbnailUrl: info.thumbnail_url,
        width: info.width,
        height: info.height,
      })

      if (response.status === 201) {
        console.log("Video metadata saved:", response.data)
        setUploadStatus("success")
        setUploadProgress(100)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      setErrorMessage(
        getUploadErrorMessage(error)
      )
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadError = (error: any) => {
    console.error("Upload error:", error)
    setErrorMessage(getUploadErrorMessage(error))
    setUploadStatus("error")
    setIsUploading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full mx-4">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Your Video
            </h1>
            <p className="text-gray-600">
              Upload short-form videos for AI-powered SEO optimization
            </p>
          </header>

          {/* OAuth Error Display */}
          {searchParams.get("error") && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                {searchParams.get("message") ||
                  "YouTube authorization required"}
              </p>
            </div>
          )}

          {/* YouTube Connection Status */}
          {!checkingYouTube && !hasYouTubeConnection && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">
                YouTube account not connected
              </p>
              <p className="text-yellow-700 text-sm mb-3">
                Connect your YouTube account to upload videos and enable automatic publishing.
              </p>
              <form action="/api/auth/youtube" method="GET">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C7161C] text-white rounded-lg hover:bg-[#C7161C]/90 transition-colors font-medium text-sm"
                >
                  Connect YouTube Account
                </button>
              </form>
            </div>
          )}

          {/* Upload Widget */}
          <div className="flex justify-center">
            <VideoUploadWidget
              onUploadStart={async () => {
                const canProceed = await handleUploadStart()
                if (!canProceed) {
                  return
                }
                setIsUploading(true)
                setUploadStatus("uploading")
                setUploadProgress(0)
              }}
              onUploadProgress={(progress) => {
                setUploadProgress(progress)
              }}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              disabled={isUploading || checkingYouTube || !hasYouTubeConnection}
            />
          </div>

          {/* Progress Bar */}
          <UploadProgress progress={uploadProgress} isUploading={isUploading} />

          {/* Success Message */}
          {uploadStatus === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-semibold mb-2">
                Video uploaded successfully! AI processing has started.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errorMessage}</p>
              <button
                onClick={() => {
                  setUploadStatus("idle")
                  setErrorMessage("")
                  setUploadProgress(0)
                }}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Guidelines Section */}
          <section className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-3">
              Video Requirements
            </h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Format: MP4, MOV, or AVI</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Maximum file size: 50MB</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Maximum duration: 60 seconds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vertical or square aspect ratio recommended</span>
              </li>
            </ul>
          </section>

          {/* Features Section */}
          <section className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">
              What Happens Next?
            </h2>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>AI analyzes your video content</li>
              <li>Generates optimized title and description</li>
              <li>Suggests relevant tags and keywords</li>
              <li>Recommends thumbnail improvements</li>
              <li>Ready for YouTube publishing</li>
            </ol>
          </section>
        </article>
      </div>
    </div>
  )
}
