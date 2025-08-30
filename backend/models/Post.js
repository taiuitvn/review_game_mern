import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  value: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
});


const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    tags: [{ type: String }],
    ratings: [ratingSchema],
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
