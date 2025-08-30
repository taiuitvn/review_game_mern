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
