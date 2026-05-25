import type { Metadata } from "next"
import UploadPageClient from "./UploadPageClient"

/**
 * SEO Metadata for the upload page
 * Optimized for search engines and social sharing
 */
export const metadata: Metadata = {
  title:
    "Upload Video - GoViral | AI-Powered SEO Optimization",
  description:
    "Upload your short-form videos to GoViral for AI-powered SEO optimization. Automatically generate titles, descriptions, tags, and keywords optimized for discoverability.",
  keywords: [
    "video upload",
    "AI SEO",
    "short-form video",
    "content creator tools",
    "video marketing",
    "viral video",
    "video metadata",
  ],
  authors: [{ name: "GoViral Team" }],
  creator: "GoViral",
  publisher: "GoViral",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Upload Video - GoViral",
    description:
      "AI-powered SEO optimization for short-form videos",
    type: "website",
    locale: "en_US",
    siteName: "GoViral",
    url: "https://goviral.app/upload",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upload Video - GoViral",
    description:
      "AI-powered SEO optimization for short-form videos",
    creator: "@goviral",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification tokens here when needed
  },
}

/**
 * Upload Page
 * Allows signed-in users to upload short-form videos (<60s, <50MB)
 * with real-time progress feedback and automatic SEO optimization
 */
export default function UploadPage() {
  return <UploadPageClient />
}
