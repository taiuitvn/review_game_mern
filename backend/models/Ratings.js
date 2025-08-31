import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
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
  },
  { timestamps: true }
);

ratingSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
