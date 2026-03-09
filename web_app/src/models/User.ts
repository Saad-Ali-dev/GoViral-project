import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    youtubeAccessToken: String,
    youtubeRefreshToken: String,
    youtubeTokenExpiry: Date,
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)
