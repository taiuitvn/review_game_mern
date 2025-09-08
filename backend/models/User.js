import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, "Please tell us your name!"] },
  email: { type: String, required: [true, "Please provide your email!"] },
  passwordHash: String,
  avatarUrl: String,
  bio: String,
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
