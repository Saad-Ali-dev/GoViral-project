import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },

  },
  {
    timestamps: true,
  },
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)
