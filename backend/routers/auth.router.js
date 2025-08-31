import express from "express";
import {
  getAllUsers,
  getUserById,
  login,
  register,
  removeById,
  updateUser,
  getPostsByUserId,
  getMyPosts,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";
const auth_router = express.Router();

auth_router.get("/users", getAllUsers);
auth_router.get("/user/:id", getUserById);
auth_router.get("/user/:id/posts", getPostsByUserId);
auth_router.post("/register", register);
auth_router.post("/login", login);
auth_router.post("/remove/:id", removeById);
auth_router.put("/update/:id", auth, updateUser);
auth_router.put("/post/me", auth, getMyPosts);

export default auth_router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTIyZGQ3ZDAwNWY4ODRkMGVjNGU5YSIsImlhdCI6MTc1NDQxMzM2OSwiZXhwIjoxNzU1MDE4MTY5fQ.x-PlVub0x8Ojx5OExRo2ExFumTwniw7zPlRfHcxD4Qs

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Quản lý người dùng & xác thực
 */

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */

/**
 * @swagger
 * /auth/user/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 */

/**
 * @swagger
 * /auth/user/{id}/posts:
 *   get:
 *     summary: Lấy danh sách bài viết của 1 user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Danh sách bài viết của user
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               username: "thangnguyen"
 *               email: "example@email.com"
 *               password: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               email: "thang.example@email.com"
 *               password: "abc123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công (JWT token trả về)
 */

/**
 * @swagger
 * /auth/remove/{id}:
 *   post:
 *     summary: Xóa người dùng theo ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Người dùng đã bị xóa
 */

/**
 * @swagger
 * /auth/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               username: "new name"
 *               email: "newemail@email.com"
 *     responses:
 *       200:
 *         description: Thông tin người dùng đã được cập nhật
 */

/**
 * @swagger
 * /auth/post/me:
 *   put:
 *     summary: Lấy danh sách bài viết của user hiện tại (qua JWT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài viết của user hiện tại
 */
