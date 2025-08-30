import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
