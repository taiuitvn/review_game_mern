import User from "../models/User.js";
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

    const user = await User.fidnById(userId)
      .select("-passwordHash") // ẩn mật khẩu khi trả về
      .populate("savedPosts"); // nếu muốn lấy cả bài viết đã lưu

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

    const posts = await Post.find({ author: userId })
      .populate("author", "username email avatarUrl") // lấy thông tin cơ bản của user
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
    const posts = await Post.find({ author: req.userId })
      .populate("author", "username email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};