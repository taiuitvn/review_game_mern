import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePostById,
  removePostById,
  likePost,
  getPostByTitle,
  searchPosts,
  savePost,
  getTrendingPosts,
  getSavedPosts,
  incrementPostViews,
  getPostsByGenre,
  getPostsByPlatform,
  getAllGenres,
  getAllPlatforms
} from "../controllers/post.controller.js";
import { auth, optionalAuth } from "../middleware/auth.js";
const post_router = express.Router();

post_router.get("/", getAllPosts);
// Specific routes should be registered before dynamic ":id" route
post_router.get("/trending", getTrendingPosts);
post_router.get("/search", searchPosts);
post_router.get("/search/:title", getPostByTitle);
post_router.get("/me/saved", auth, getSavedPosts);

// Genre and Platform routes
post_router.get("/genres", getAllGenres);
post_router.get("/platforms", getAllPlatforms);
post_router.get("/genre/:genre", getPostsByGenre);
post_router.get("/platform/:platform", getPostsByPlatform);

post_router.post("/create", auth, createPost);
post_router.put("/update/:id", auth, updatePostById);
post_router.delete("/remove/:id", auth, removePostById);
post_router.put("/:id/like", auth, likePost);
post_router.post("/:id/save", auth, savePost);
post_router.post("/:id/view", incrementPostViews);
post_router.get("/:id", optionalAuth, getPostById);
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
 * /posts/search:
 *   get:
 *     summary: Tìm kiếm bài viết nâng cao
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, newest, oldest, rating, views, likes]
 *         description: Sắp xếp kết quả
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *           enum: [all, 5, 4+, 3+]
 *         description: Lọc theo đánh giá
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Lọc theo tags (phân cách bằng dấu phẩy)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Lọc theo tác giả
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số kết quả mỗi trang
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm với thông tin phân trang
 *
 * @swagger
 * /posts/search/{title}:
 *   get:
 *     summary: Tìm bài viết theo tiêu đề (phương pháp cũ)
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
