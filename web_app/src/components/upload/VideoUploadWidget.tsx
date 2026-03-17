"use client"

import React from "react"
import { CldUploadWidget, CldUploadWidgetProps } from "next-cloudinary"

interface VideoUploadWidgetProps
  extends Omit<CldUploadWidgetProps, "uploadPreset" | "options"> {
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
  onUploadSuccess?: (result: any) => Promise<void>
  onUploadError?: (error: any) => void
  disabled?: boolean
}

/**
 * VideoUploadWidget wraps CldUploadWidget with pre-configured
 * options for GoViral video uploads
 */
export function VideoUploadWidget({
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  ...props
}: VideoUploadWidgetProps) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign-cloudinary-params"
      uploadPreset="GoViral-Video"
      options={{
        sources: ["local", "camera", "url"],
        maxFiles: 1,
        resourceType: "video",
        clientAllowedFormats: ["mp4", "mov", "avi"],
        maxFileSize: 52428800, // 50MB
        folder: "goviral/videos",
      }}
      onUploadAdded={() => {
        onUploadStart?.()
      }}
      onProgress={(result) => {
        const { loaded, total } = result.event || {}
        if (loaded && total) {
          const progress = Math.round((loaded / total) * 100)
          onUploadProgress?.(progress)
        }
      }}
      onSuccess={async (result, { widget }) => {
        try {
          await onUploadSuccess?.(result)
        } finally {
          widget.close()
        }
      }}
      onError={(error) => {
        onUploadError?.(error)
      }}
      {...props}
    >
      {({ open }) => (
        <button
          onClick={() => open()}
          disabled={disabled}
          className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Select Video
        </button>
      )}
    </CldUploadWidget>
  )
}
