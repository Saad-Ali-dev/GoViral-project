import type { Metadata } from "next"
import ProcessingClient from "./ProcessingClient"

export const metadata: Metadata = {
  title: "Processing Video - GoViral | AI-Powered SEO",
  description:
    "Your video is being processed by GoViral's AI. We're generating optimized metadata for your short-form video.",
  keywords: [
    "video processing",
    "AI SEO",
    "short-form video",
    "processing status",
  ],
  openGraph: {
    title: "Processing Video - GoViral",
    description: "Your video is being processed by AI",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProcessingPage() {
  return <ProcessingClient />
}