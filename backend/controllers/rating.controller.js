import Post from "../models/Post.js";
import Rating from "../models/Ratings.js";

export const ratePost = async (req, res) => {
  try {
    const { value } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const rating = await Rating.findOneAndUpdate(
      { postId: id, userId },
      { value },
      { new: true, upsert: true }
    );

    res.json({ message: "Rated successfully", rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostByRating = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate("authorId", "username");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const ratings = await Rating.find({ postId: id }).populate(
      "userId",
      "username"
    );

    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;

    res.json({
      post,
      avgRating: Number(avgRating.toFixed(2)), // làm tròn 2 số thập phân
      totalRatings: ratings.length,
      ratings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// xóa rating
export const deleteRating = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOneAndDelete({ postId, userId });
    if (!rating) {
      return res
        .status(404)
        .json({ message: "Bạn chưa đánh giá bài viết này" });
    }

    res.json({ message: "Đã xóa đánh giá thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// lấy đánh giá của 1 người với 1 bài viết
export const getUserRatingForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ postId, userId });
    if (!rating) {
      return res
        .status(404)
        .json({ message: "Bạn chưa đánh giá bài viết này" });
    }

    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
