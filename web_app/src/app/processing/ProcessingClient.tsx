"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"

export default function ProcessingClient() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("video_id")
  const [statusMessage, setStatusMessage] = useState("Processing your video...")

  useEffect(() => {
    const messages = [
      "Analyzing your video content...",
      "Generating SEO-optimized titles...",
      "Creating engaging descriptions...",
      "Finding relevant tags and keywords...",
      "Preparing your video for YouTube...",
    ]

    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setStatusMessage(messages[index])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-5xl mx-auto p-8 bg-[#212121] rounded-[20px]">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 ">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
              poster="/logo.png"
            >
              <source src="/bot-animation.mp4" type="video/mp4" />
              <Image
                src="/logo.png"
                alt="GoViral"
                fill
                className="object-contain"
              />
            </video>
          </div>

          <h1
            className="text-2xl text-white font-semibold mb-2 text-center"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            GoViral Agent
          </h1>

          <p className="text-white/80 text-center mb-4">{statusMessage}</p>

          <div className="w-[50%] bg-white/10 rounded-full h-2 mb-4">
            <div
              className="bg-red-500 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>

          <p className="text-white/50 text-sm text-center">
            This may take up to 2 minutes
          </p>

          {videoId && (
            <p className="text-white/30 text-xs mt-4">
              Video ID: {videoId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
