"use client"

import React from "react"

interface UploadProgressProps {
  progress: number
  isUploading: boolean
}

/**
 * UploadProgress component displays a visual progress bar
 * for video upload operations
 */
export function UploadProgress({ progress, isUploading }: UploadProgressProps) {
  if (!isUploading) {
    return null
  }

  return (
    <div className="w-full mt-6">
      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-gray-600 mt-2">{progress}% uploaded</p>
    </div>
  )
}
