import User from "../models/User.js";
import Post from "../models/Post.js";
import Rating from "../models/Ratings.js";
import Comment from "../models/Comment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../services/emailService.js";
import { createNotificationHelper } from "./notification.controller.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hashed });
    
    // Generate token for automatic login after registration
    const token = jwt.sign({ id: user._id }, "SECRET", { expiresIn: "7d" });
    
    // Remove password hash from response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      savedPosts: user.savedPosts,
      followers: user.followers,
      following: user.following,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      bodyType: typeof req.body,
      keys: Object.keys(req.body || {})
    });
    
    const { email, password } = req.body;
    
    console.log('Destructured values:', {
      email,
      emailType: typeof email,
      password,
      passwordType: typeof password
    });
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ msg: "Wrong password" });
    const token = jwt.sign({ id: user._id }, "SECRET", { expiresIn: "7d" });
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
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

    // Instead of returning 404 when no posts, return empty array with 200 status
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
      avgRating: Math.round(avgRating)
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
    
    // Create follow notification
    try {
      await createNotificationHelper({
        userId: targetUserId,
        fromUserId: currentUserId,
        type: 'follow',
        title: 'Người theo dõi mới',
        message: `${currentUser.username} đã bắt đầu theo dõi bạn`,
        data: {
          followerUsername: currentUser.username,
          followerAvatar: currentUser.avatarUrl
        }
      });
      console.log('Follow notification created');
    } catch (notifError) {
      console.error('Error creating follow notification:', notifError);
      // Don't fail the follow operation if notification fails
    }

    res.json({ 
      message: "Theo dõi thành công",
      data: {
        followersCount: targetUser.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (err) {
    console.error('Error in followUser:', err);
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

// Password reset functionality
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Forgot password request for:', email);
    
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        error: "Please provide your email address" 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, we don't reveal if the email exists or not
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the reset token and save to database with expiration (1 hour)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // Send email (mock for now)
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl);
    
    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        message: "Failed to send reset email",
        error: "Please try again later"
      });
    }
    
    console.log('Password reset email sent to:', email);
    console.log('Reset token (for development):', resetToken);
    
    res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
      // Include token in response for development/testing (remove in production)
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: "Server error during password reset request", 
      error: error.message 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    console.log('Reset password request with token:', token);
    
    // Validate input
    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirmation are required",
        error: "Please provide both password and confirmation"
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords don't match",
        error: "Password and confirmation must be identical"
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password too short",
        error: "Password must be at least 6 characters long"
      });
    }
    
    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
        error: "Please request a new password reset link"
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password and clear reset fields
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();
    
    await user.save();
    
    // Send confirmation email
    await sendPasswordResetConfirmation(user.email);
    
    console.log('Password reset successful for user:', user.email);
    
    res.status(200).json({
      message: "Password reset successful",
      success: true
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: "Server error during password reset", 
      error: error.message 
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        message: "Search query is required",
        error: "Please provide a search term"
      });
    }
    
    const searchTerm = q.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Create search query for username and email
    const searchQuery = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    
    // Find users with pagination
    const users = await User.find(searchQuery)
      .select('_id username email avatarUrl createdAt followers following') 
      .sort({ username: 1 })
      .skip(skip)
      .limit(limitNum);
    
    // Add follower/following counts
    const usersWithStats = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatarUrl, 
      createdAt: user.createdAt,
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0
    }));
    
    const totalPages = Math.ceil(totalUsers / limitNum);
    
    res.status(200).json({
      users: usersWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: "Server error during user search", 
      error: error.message 
    });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('Validating reset token:', token);
    
    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token",
        error: "Please request a new password reset link"
      });
    }
    
    res.status(200).json({
      valid: true,
      message: "Token is valid",
      email: user.email // Optionally return email for display
    });
    
  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({ 
      valid: false,
      message: "Server error during token validation", 
      error: error.message 
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("followers", "username email avatarUrl bio createdAt");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
