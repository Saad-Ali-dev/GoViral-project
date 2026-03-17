/**
 * Error message constants and utilities for video upload
 * Provides consistent, user-friendly error messages across the application
 */

/**
 * Upload error codes and their corresponding messages
 */
export const UPLOAD_ERROR_MESSAGES = {
  // File type errors
  INVALID_FILE_TYPE:
    "Unsupported file format. Please upload MP4, MOV, AVI or WebM files.",
  
  // File size errors
  FILE_TOO_LARGE:
    "File size exceeds limit. Maximum size is 50MB.",
  
  // Duration errors
  DURATION_EXCEEDS_LIMIT:
    "Video duration exceeds limit. Maximum duration is 60 seconds.",
  
  // Network errors
  NETWORK_ERROR:
    "Network error occurred. Please check your connection and try again.",
  
  // Server errors
  SERVER_ERROR:
    "Server error occurred. Please try again later.",
  
  // Authentication errors
  UNAUTHORIZED:
    "Please sign in to upload videos.",
  
  // Upload specific errors
  UPLOAD_FAILED:
    "Upload failed. Please try again.",
  
  METADATA_SAVE_FAILED:
    "Failed to save video metadata. Please try again.",
  
  // OAuth errors
  YOUTUBE_OAUTH_REQUIRED:
    "YouTube authorization required to upload videos.",
  
  YOUTUBE_OAUTH_DENIED:
    "YouTube authorization was denied. Please connect your YouTube account to upload.",
  
  YOUTUBE_OAUTH_FAILED:
    "Unable to complete YouTube authorization. Please try again.",
  
  YOUTUBE_TOKEN_EXPIRED:
    "YouTube connection expired. Please reconnect your YouTube account.",
} as const

/**
 * Get user-friendly error message from error code or error object
 * @param error - Error code string or Error object
 * @returns User-friendly error message
 */
export function getUploadErrorMessage(error: string | Error | unknown): string {
  if (typeof error === "string") {
    // Check if it's a known error code
    if (error in UPLOAD_ERROR_MESSAGES) {
      return UPLOAD_ERROR_MESSAGES[error as keyof typeof UPLOAD_ERROR_MESSAGES]
    }
    // Return the error string itself if not recognized
    return error
  }
  
  if (error instanceof Error) {
    // Check for known error messages in the error object
    const message = error.message.toLowerCase()
    
    if (message.includes("file type") || message.includes("format")) {
      return UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE
    }
    if (message.includes("size") || message.includes("large")) {
      return UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE
    }
    if (message.includes("duration") || message.includes("long")) {
      return UPLOAD_ERROR_MESSAGES.DURATION_EXCEEDS_LIMIT
    }
    if (message.includes("network") || message.includes("connection")) {
      return UPLOAD_ERROR_MESSAGES.NETWORK_ERROR
    }
    if (message.includes("unauthorized") || message.includes("sign in")) {
      return UPLOAD_ERROR_MESSAGES.UNAUTHORIZED
    }
    if (message.includes("oauth") || message.includes("authorization")) {
      if (message.includes("denied")) {
        return UPLOAD_ERROR_MESSAGES.YOUTUBE_OAUTH_DENIED
      }
      if (message.includes("expired")) {
        return UPLOAD_ERROR_MESSAGES.YOUTUBE_TOKEN_EXPIRED
      }
      return UPLOAD_ERROR_MESSAGES.YOUTUBE_OAUTH_REQUIRED
    }
    
    // Default to server error or the error message itself
    return error.message || UPLOAD_ERROR_MESSAGES.SERVER_ERROR
  }
  
  // Unknown error type
  return UPLOAD_ERROR_MESSAGES.SERVER_ERROR
}

/**
 * Check if an error is retryable
 * @param error - Error code or Error object
 * @returns True if the error can be retried
 */
export function isRetryableError(error: string | Error | unknown): boolean {
  const message = typeof error === "string" ? error.toLowerCase() : 
                  error instanceof Error ? error.message.toLowerCase() : ""
  
  // Network errors and server errors are typically retryable
  const retryableKeywords = ["network", "timeout", "server", "connection"]
  
  return retryableKeywords.some(keyword => message.includes(keyword))
}

/**
 * Get error severity level
 * @param error - Error code or Error object
 * @returns "info" | "warning" | "error"
 */
export function getErrorSeverity(error: string | Error | unknown): "info" | "warning" | "error" {
  const message = typeof error === "string" ? error.toLowerCase() : 
                  error instanceof Error ? error.message.toLowerCase() : ""
  
  // Info level - user action needed but not critical
  if (message.includes("sign in") || message.includes("authorization")) {
    return "info"
  }
  
  // Warning level - validation errors
  if (message.includes("format") || message.includes("size") || message.includes("duration")) {
    return "warning"
  }
  
  // Error level - system errors
  return "error"
}
