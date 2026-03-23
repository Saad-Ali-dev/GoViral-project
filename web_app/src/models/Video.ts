import mongoose, { Document, Model } from "mongoose"

export interface IVideo extends Document {
  userId: string // Links to User.clerkId
  originalFilename?: string
  size: number
  duration: number
  status: "pending" | "processing" | "completed" | "failed" | "published"
  cloudinaryUrl?: string
  thumbnailUrl?: string
  publicId?: string
  aiResponse?: {
    title: string
    description: string
    tags: string[]
    categoryId: number
    viralScore: number
  }
  youtubeUrl?: string
  youtubeVideoId?: string
  metadata?: {
    resourceType?: string
    width?: number
    height?: number
    aspectRatio?: number
    tags?: string[]
    originalFilename?: string
  }
  agentServiceNotified?: boolean
  createdAt: Date
  updatedAt: Date
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    userId: { type: String, required: true, index: true },
    originalFilename: { type: String },
    size: { type: Number, required: true, min: 1, max: 52428800 },
    duration: { type: Number, required: true, min: 0, max: 60 },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "completed", "failed", "published"],
      default: "pending",
    },
    cloudinaryUrl: { type: String },
    thumbnailUrl: { type: String },
    publicId: { type: String },
    aiResponse: {
      title: String,
      description: String,
      tags: [String],
      categoryId: Number,
      viralScore: Number,
    },
    youtubeUrl: { type: String },
    youtubeVideoId: { type: String },
    metadata: {
      resourceType: String,
      width: Number,
      height: Number,
      aspectRatio: Number,
      tags: [String],
      originalFilename: String,
    },
    agentServiceNotified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries by user and date
videoSchema.index({ userId: 1, createdAt: -1 })

export const Video =
  mongoose.models.Video || mongoose.model<IVideo>("Video", videoSchema)
