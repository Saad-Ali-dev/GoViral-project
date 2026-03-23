"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

interface YouTubeStatus {
  isConnected: boolean
  channelName?: string
}

/**
 * ConnectYouTubeButton component
 * Displays connection status and provides OAuth initiation
 * Used in Navbar and Sidebar
 */
export default function ConnectYouTubeButton() {
  const { isLoaded, isSignedIn } = useUser()
  const [youtubeStatus, setYoutubeStatus] = useState<YouTubeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchYouTubeStatus() {
      if (!isLoaded || !isSignedIn) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/youtube-status")
        if (response.ok) {
          const data = await response.json()
          setYoutubeStatus(data)
        }
      } catch (error) {
        console.error("Error fetching YouTube status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchYouTubeStatus()
  }, [isLoaded, isSignedIn])

  // Not loaded yet or user not signed in
  if (!isLoaded || !isSignedIn) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full py-3 px-4 bg-gray-700/20 border border-gray-600/50 rounded-lg text-gray-400 text-sm font-medium flex items-center justify-center">
        <span>Loading...</span>
      </div>
    )
  }

  // Show connected state
  if (youtubeStatus?.isConnected) {
    return (
      <div className="w-full py-3 px-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400 text-sm font-medium cursor-default flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Connected</span>
      </div>
    )
  }

  // Show connect button
  return (
    <form action="/api/auth/youtube" method="GET" className="w-full">
      <button
        type="submit"
        className="w-full py-2 px-4 bg-[#C7161C] text-white font-semibold rounded hover:bg-[#C7161C]/90 cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <span>Connect YouTube</span>
      </button>
    </form>
  )
}
