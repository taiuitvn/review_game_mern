import Post from "../models/Post.js";
import Rating from "../models/Ratings.js";
import { createNotificationHelper } from "./notification.controller.js";

export const ratePost = async (req, res) => {
  try {
    const { value } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate('authorId', 'username');
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if this is a new rating (for notification purposes)
    const existingRating = await Rating.findOne({ postId, userId });
    const isNewRating = !existingRating;

    const rating = await Rating.findOneAndUpdate(
      { postId, userId },
      { value },
      { new: true, upsert: true }
    );

    // Create notification for new ratings (not updates)
    if (isNewRating && post.authorId && post.authorId._id.toString() !== userId) {
      try {
        await createNotificationHelper({
          userId: post.authorId._id,
          fromUserId: userId,
          type: 'post_rating',
          title: 'Đánh giá mới',
          message: `đã đánh giá ${value} sao cho bài viết "${post.title}" của bạn`,
          postId: post._id,
          data: {
            postTitle: post.title,
            rating: value,
            gameName: post.gameName
          }
        });
        console.log('Rating notification created for post:', post._id);
      } catch (notifError) {
        console.error('Error creating rating notification:', notifError);
        // Don't fail the rating operation if notification fails
      }
    }

    res.json({ 
      message: "Rated successfully", 
      rating,
      isNewRating
    });
  } catch (err) {
    console.error('Error in ratePost:', err);
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
      avgRating: parseFloat(avgRating.toFixed(1)), // làm tròn 1 chữ số thập phân
      averageRating: parseFloat(avgRating.toFixed(1)), // thêm field này để tương thích
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
