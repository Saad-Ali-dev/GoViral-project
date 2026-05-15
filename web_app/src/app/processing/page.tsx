import type { Metadata } from "next"
import ProcessingClient from "./ProcessingClient"

export const metadata: Metadata = {
  title: "Processing Video - GoViral | AI-Powered YouTube SEO",
  description:
    "Your video is being processed by GoViral's AI. We're generating optimized metadata for your YouTube short.",
  keywords: [
    "video processing",
    "AI SEO",
    "YouTube optimization",
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