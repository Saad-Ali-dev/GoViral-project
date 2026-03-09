import mongoose from "mongoose"

const videoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Links to User.clerkId
    originalFilename: String,
    size: { type: Number, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "published"],
      default: "pending",
    },
    cloudinaryUrl: String,
    thumbnailUrl: String, // Storing URL instead of base64
    aiResponse: {
      title: String,
      description: String,
      tags: [String],
      categoryId: Number,
      viralScore: Number,
    },
    youtubeUrl: String,
    youtubeVideoId: String, // ID returned by YouTube after publishing
  },
  {
    timestamps: true,
  },
)

export const Video =
  mongoose.models.Video || mongoose.model("Video", videoSchema)
