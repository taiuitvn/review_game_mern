import Post from "../models/Post.js";
import User from "../models/User.js";
import { uploadImage } from "../services/uploadImage.js";

export const createPost = async (req, res) => {
  try {
    const { title, content, tags, authorId, imageHash, imageBase64 } = req.body;

    const existingPost = await Post.findOne({ imageHash });
    let coverImageUrl;
    let publicId;

    if (existingPost) {
      // reuse
      coverImageUrl = existingPost.coverImageUrl;
      publicId = existingPost.publicId;
    } else {
      // Upload new image
      const uploaded = await uploadImage(imageBase64, "image_grv");
      coverImageUrl = uploaded.url;
      publicId = uploaded.public_id;
    }

    const newPost = await Post.create({
      title,
      content,
      tags,
      authorId,
      coverImageUrl,
      publicId,
      imageHash,
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // return the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // Lấy page và limit từ query, mặc định page=1, limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Đếm tổng số posts để tính tổng số trang
    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId");

    res.json({
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("authorId");
  if (!post) return res.status(404).json({ msg: "Post not found" });
  res.json(post);
};

export const removePostById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.deleteOne({ _id: id });
  if (!post) return res.status(404).json({ msg: "Post not found" });
  res.json(post);
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) post.likes.push(userId); // Like
    else post.likes.splice(index, 1); // Unlike
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const savePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const index = user.savedPosts.indexOf(post._id);
  if (index === -1) {
    user.savedPosts.push(post._id);
    post.savedBy.push(user._id);
  } else {
    user.savedPosts.splice(index, 1);
    post.savedBy.splice(index, 1);
  }
  await user.save();
  await post.save();
  res.json(user.savedPosts);
};

export const getPostByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    // const post = await Post.findOne({ title });

    const post = await Post.findOne({
      title: { $regex: new RegExp(title, "i") },
    }).populate("authorId");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách bài viết trending
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find().populate("authorId", "username").lean();

    const postsWithScore = await Promise.all(
      posts.map(async (post) => {
        // Lấy rating trung bình
        const ratings = await Rating.find({ postId: post._id });
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
            : 0;

        // Công thức tính điểm trending theo gpt
        const score =
          post.views * 0.4 + (post.likes?.length || 0) * 0.3 + avgRating * 2;

        return {
          ...post,
          avgRating,
          score,
        };
      })
    );

    // Sắp xếp score giảm dần
    postsWithScore.sort((a, b) => b.score - a.score);

    res.json(postsWithScore.slice(0, limit));
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId; // đã gắn sẵn từ middleware auth

    const posts = await Post.find({ savedBy: userId })
      .populate("authorId", "username email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
