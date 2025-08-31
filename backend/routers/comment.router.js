import express from "express";
import {
  getCommentByPostId,
  removeCommentById,
  createComment,
  editCommentById,
  likeComment,
} from "../controllers/comment.controller.js";
import { auth } from "../middleware/auth.js";
const comments_router = express.Router();

comments_router.get("/post/:id", getCommentByPostId);
comments_router.post("/like/:id", auth, likeComment);
comments_router.delete("/remove/:id", removeCommentById);
comments_router.put("/edit/:id", editCommentById);
comments_router.post("/", createComment);

export default comments_router;

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API cho bình luận
 */

/**
 * @swagger
 * /comments/post/{id}:
 *   get:
 *     summary: Lấy tất cả bình luận của một bài viết
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Tạo bình luận mới
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "64a8b7c1234567890"
 *               content:
 *                 type: string
 *                 example: "Bài viết hay quá!"
 *     responses:
 *       201:
 *         description: Tạo bình luận thành công
 */

/**
 * @swagger
 * /comments/edit/{id}:
 *   put:
 *     summary: Chỉnh sửa bình luận
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Mình chỉnh sửa bình luận này."
 *     responses:
 *       200:
 *         description: Bình luận đã được cập nhật
 */

/**
 * @swagger
 * /comments/remove/{id}:
 *   delete:
 *     summary: Xóa bình luận
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bình luận
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy bình luận
 */

/**
 * @swagger
 * /comments/like/{id}:
 *   post:
 *     summary: Like hoặc bỏ like một bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bình luận
 *     responses:
 *       200:
 *         description: Đã like hoặc bỏ like
 *       401:
 *         description: Chưa đăng nhập
 */
