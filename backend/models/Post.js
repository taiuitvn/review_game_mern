import mongoose from "mongoose";


const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // có ref để populate nếu muốn
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // tuỳ bạn dùng hay không
  },
  { timestamps: true } // tự động tạo createdAt & updatedAt
);

export default mongoose.model("Post", postSchema);
