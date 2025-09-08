import express from "express";
import {
  getNotificationsByUserId,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  getNotifybyUserId // Legacy compatibility
} from "../controllers/notification.controller.js";
import { auth } from "../middleware/auth.js";

const notify_router = express.Router();

// Public routes (no auth required)
notify_router.get("/list/:id", getNotifybyUserId); // Legacy endpoint
notify_router.post("/create", createNotification);

// Protected routes (auth required)
notify_router.get("/me", auth, getNotificationsByUserId); // Get current user's notifications
notify_router.get("/stats", auth, getNotificationStats); // Get notification statistics
notify_router.put("/read/:id", auth, markAsRead); // Mark specific notification as read
notify_router.put("/read-all", auth, markAllAsRead); // Mark all notifications as read
notify_router.delete("/:id", auth, deleteNotification); // Delete specific notification

export default notify_router;

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Enhanced notification management system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Notification ID
 *         userId:
 *           type: string
 *           description: ID of user receiving notification
 *         fromUserId:
 *           type: string
 *           description: ID of user who triggered notification
 *         type:
 *           type: string
 *           enum: [like, comment, reply, follow, post_rating, mention]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         isRead:
 *           type: boolean
 *           description: Read status
 *         postId:
 *           type: string
 *           description: Related post ID (optional)
 *         commentId:
 *           type: string
 *           description: Related comment ID (optional)
 *         data:
 *           type: object
 *           description: Additional notification data
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter unread notifications only
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [like, comment, reply, follow, post_rating, mention]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                     unreadCount:
 *                       type: integer
 */

/**
 * @swagger
 * /notifications/create:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - fromUserId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               fromUserId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [like, comment, reply, follow, post_rating, mention]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               postId:
 *                 type: string
 *               commentId:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notification created successfully
 */

/**
 * @swagger
 * /notifications/read/{id}:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */

/**
 * @swagger
 * /notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     unreadCount:
 *                       type: integer
 *                     readCount:
 *                       type: integer
 *                     typeBreakdown:
 *                       type: object
 */
