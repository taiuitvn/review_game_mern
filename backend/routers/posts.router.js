import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  savePost,
  updatePostById,
  removePostById,
  getPostByTitle,
  getTrendingPosts,
  getSavedPosts,
} from "../controllers/post.controller.js";
import { auth } from "../middleware/auth.js";
const post_router = express.Router();

post_router.get("/", getAllPosts);
post_router.get("/:id", getPostById);
post_router.post("/update/:id", updatePostById);
post_router.post("/remove/:id", removePostById);
post_router.post("/create", createPost);
post_router.put("/:id/like", auth, likePost);
post_router.post("/:id/save", auth, savePost);
post_router.get("/search/:title", getPostByTitle);
post_router.get("/trending", getTrendingPosts);
post_router.get("/me/saved", auth, getSavedPosts);
export default post_router;

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Quản lý bài viết (posts)
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lấy tất cả bài viết
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Lấy bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin bài viết
 */

/**
 * @swagger
 * /posts/update/{id}:
 *   post:
 *     summary: Cập nhật bài viết
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết cần update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: "Bài viết mới"
 *               content: "Nội dung đã sửa"
 *     responses:
 *       200:
 *         description: Bài viết đã được cập nhật
 */

/**
 * @swagger
 * /posts/remove/{id}:
 *   post:
 *     summary: Xóa bài viết
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết cần xóa
 *     responses:
 *       200:
 *         description: Bài viết đã được xóa
 */

/**
 * @swagger
 * /posts/create:
 *   post:
 *     summary: Tạo bài viết mới
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: "Bài viết mới"
 *               content: "Nội dung bài viết"
 *               authorId: "12345"
 *     responses:
 *       201:
 *         description: Bài viết đã được tạo
 */

/**
 * @swagger
 * /posts/{id}/like:
 *   put:
 *     summary: Thích (like) một bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Đã like bài viết
 */

/**
 * @swagger
 * /posts/{id}/save:
 *   post:
 *     summary: Lưu một bài viết vào danh sách cá nhân
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Đã lưu bài viết
 */

/**
 * @swagger
 * /posts/search/{title}:
 *   get:
 *     summary: Tìm bài viết theo tiêu đề
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Tiêu đề bài viết
 *     responses:
 *       200:
 *         description: Danh sách bài viết phù hợp
 */

/**
 * @swagger
 * /posts/trending:
 *   get:
 *     summary: Lấy danh sách bài viết thịnh hành
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách bài viết trending
 */

/**
 * @swagger
 * /posts/me/saved:
 *   get:
 *     summary: Lấy danh sách bài viết đã lưu của người dùng
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài viết đã lưu
 */
