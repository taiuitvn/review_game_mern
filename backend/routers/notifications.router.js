import express from "express";
import {
  getNotifybyUserId,
  createNotification,
} from "../controllers/notification.controller.js";
const nofity_router = express.Router();

nofity_router.get("/list/:id", getNotifybyUserId);
nofity_router.post("/create", createNotification);

export default nofity_router;

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Quản lý thông báo (notifications)
 */

/**
 * @swagger
 * /notifications/list/{id}:
 *   get:
 *     summary: Lấy danh sách thông báo của người dùng
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách thông báo của user
 */

/**
 * @swagger
 * /notifications/create:
 *   post:
 *     summary: Tạo thông báo mới
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               userId: "12345"
 *               message: "Bạn có thông báo mới"
 *               type: "comment"
 *     responses:
 *       201:
 *         description: Thông báo đã được tạo
 */
