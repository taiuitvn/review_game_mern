import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    publicId: { type: String }, // Cloudinary public ID
    imageHash: { type: String }, // For image deduplication
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Review-specific fields
    gameId: { type: String }, // RAWG game ID
    gameName: { type: String }, // Game name
    gameImage: { type: String }, // Game cover image URL
    rating: { type: Number, min: 1, max: 5 }, // User rating (1-5 stars)
    platforms: [{ type: String }], // Game platforms (PC, PlayStation, Xbox, etc.)
    genres: [{ type: String }], // Game genres
  },
  { timestamps: true } // automatically creates createdAt & updatedAt
);

export default mongoose.model("Post", postSchema);