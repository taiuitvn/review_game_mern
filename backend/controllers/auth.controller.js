import User from "../models/User.js";
import Post from "../models/Post.js";
import Rating from "../models/Ratings.js";
import Comment from "../models/Comment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash: hashed });
  res.status(201).json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ msg: "Wrong password" });
  const token = jwt.sign({ id: user._id }, "SECRET", { expiresIn: "7d" });
  res.json({ user, token });
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-passwordHash") // ẩn mật khẩu khi trả về
      .populate("savedPosts") // nếu muốn lấy cả bài viết đã lưu
      .populate("following", "username email avatarUrl bio createdAt") // populate following users
      .populate("followers", "username email avatarUrl bio createdAt"); // populate followers

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const removeById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.deleteOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().populate("savedPosts");

  res.json(users);
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, bio, avatarUrl, password } = req.body;

    // Tạo object chứa các field sẽ update
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;
    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.passwordHash = hashed;
    }
    updates.updatedAt = Date.now();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const posts = await Post.find({ authorId: userId })
      .populate("authorId", "username email avatarUrl") // lấy thông tin cơ bản của user
      .sort({ createdAt: -1 }); // sắp xếp mới nhất trước

    if (!posts.length) {
      return res.status(404).json({ message: "User này chưa có bài viết nào" });
    }

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.userId })
      .populate("authorId", "username email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-passwordHash")
      .populate("savedPosts")
      .populate("following", "username email avatarUrl bio createdAt") // populate following users
      .populate("followers", "username email avatarUrl bio createdAt"); // populate followers

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.userId;
    
    // Get user posts for statistics
    const userPosts = await Post.find({ authorId: userId });
    
    // Calculate total views
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // Calculate total likes
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
    
    // Get comments on user's posts
    const postIds = userPosts.map(post => post._id);
    const totalComments = await Comment.countDocuments({ postId: { $in: postIds } });
    
    // Get ratings for user's posts
    const ratings = await Rating.find({ postId: { $in: postIds } });
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length 
      : 0;
    
    res.json({
      totalPosts: userPosts.length,
      totalViews,
      totalLikes,
      totalComments,
      avgRating: Number(avgRating.toFixed(1))
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "Bạn không thể tự theo dõi chính mình" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Bạn đã theo dõi người dùng này" });
    }

    // Add to following and followers lists
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "Theo dõi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "Bạn không thể bỏ theo dõi chính mình" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Check if not following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Bạn chưa theo dõi người dùng này" });
    }

    // Remove from following and followers lists
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "Bỏ theo dõi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};