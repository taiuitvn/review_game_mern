import express from "express";
import {
  ratePost,
  getPostByRating,
  deleteRating,
  getUserRatingForPost,
} from "../controllers/rating.controller.js";
import { auth } from "../middleware/auth.js";

const rating_router = express.Router();

// Người dùng thêm hoặc cập nhật đánh giá
rating_router.post("/:postId/rate", auth, ratePost);

// Lấy post kèm rating
rating_router.get("/:id/ratings", getPostByRating);

// Xóa đánh giá của người dùng cho post
rating_router.delete("/remove/:postId", auth, deleteRating);

// Lấy rating của user hiện tại cho post
rating_router.get("/:postId/me", auth, getUserRatingForPost);
export default rating_router;

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Quản lý đánh giá (rating) bài viết
 */

/**
 * @swagger
 * /rating/{postId}/rate:
 *   post:
 *     summary: Thêm hoặc cập nhật đánh giá cho một bài viết
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết cần đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               rating: 4
 *     responses:
 *       200:
 *         description: Đã thêm/cập nhật đánh giá cho bài viết
 */

/**
 * @swagger
 * /rating/{id}/ratings:
 *   get:
 *     summary: Lấy bài viết kèm theo thông tin rating
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Thông tin bài viết kèm rating
 */

/**
 * @swagger
 * /rating/remove/{postId}:
 *   delete:
 *     summary: Xóa đánh giá của người dùng cho bài viết
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Đánh giá đã được xóa
 */

/**
 * @swagger
 * /rating/{postId}/me:
 *   get:
 *     summary: Lấy đánh giá của user hiện tại cho bài viết
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID bài viết
 *     responses:
 *       200:
 *         description: Thông tin rating của user hiện tại
 */
