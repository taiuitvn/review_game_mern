import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // For replies
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
