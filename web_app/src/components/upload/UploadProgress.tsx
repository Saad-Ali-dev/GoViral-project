"use client"

import React from "react"

interface UploadProgressProps {
  progress: number
  isUploading: boolean
  isProcessing: boolean
}

export function UploadProgress({
  progress,
  isUploading,
  isProcessing,
}: UploadProgressProps) {
  if (!isUploading && !isProcessing) {
    return null
  }

  const barClass = isProcessing
    ? "bg-indigo-500 h-full transition-all duration-500 ease-out"
    : "bg-blue-600 h-full transition-all duration-300 ease-out"

  const label = isProcessing
    ? `${Math.round(progress)}%`
    : `${Math.round(progress)}% uploaded`

  return (
    <div className="w-full mt-6">
      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className={barClass} style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-gray-600 mt-2">{label}</p>
    </div>
  )
}
