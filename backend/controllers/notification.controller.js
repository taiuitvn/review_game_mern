import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";

// Get notifications for a user with pagination and filtering
export const getNotificationsByUserId = async (req, res) => {
  try {
    const userId = req.params.id || req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type;
    
    console.log('Getting notifications for user:', userId, { page, limit, unreadOnly, type });
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        error: "Invalid user ID format",
        message: "Please provide a valid user ID" 
      });
    }
    
    // Build query
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }
    if (type && ['like', 'comment', 'reply', 'follow', 'post_rating', 'mention'].includes(type)) {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    // Get notifications with populated data
    const notifications = await Notification.find(query)
      .populate({
        path: 'fromUserId',
        select: 'username avatarUrl'
      })
      .populate({
        path: 'postId',
        select: 'title gameName coverImageUrl'
      })
      .populate({
        path: 'commentId',
        select: 'content'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    console.log('Found notifications:', {
      count: notifications.length,
      totalCount,
      unreadCount,
      page,
      totalPages
    });
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to fetch notifications" 
    });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, fromUserId, type, title, message, postId, commentId, data } = req.body;
    
    console.log('Creating notification:', { userId, fromUserId, type, title });
    
    // Validate required fields
    if (!userId || !fromUserId || !type || !title || !message) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "userId, fromUserId, type, title, and message are required" 
      });
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(fromUserId)) {
      return res.status(400).json({ 
        error: "Invalid ID format",
        message: "Please provide valid user IDs" 
      });
    }
    
    // Don't create notification if user is notifying themselves
    if (userId === fromUserId) {
      return res.status(400).json({ 
        error: "Self notification not allowed",
        message: "Cannot create notification for yourself" 
      });
    }
    
    // Validate notification type
    const validTypes = ['like', 'comment', 'reply', 'follow', 'post_rating', 'mention'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: "Invalid notification type",
        message: `Type must be one of: ${validTypes.join(', ')}` 
      });
    }
    
    const notificationData = {
      userId,
      fromUserId,
      type,
      title,
      message,
      data: data || {}
    };
    
    // Add optional references
    if (postId && mongoose.Types.ObjectId.isValid(postId)) {
      notificationData.postId = postId;
    }
    if (commentId && mongoose.Types.ObjectId.isValid(commentId)) {
      notificationData.commentId = commentId;
    }
    
    const newNotification = await Notification.create(notificationData);
    
    // Populate the created notification
    const populatedNotification = await Notification.findById(newNotification._id)
      .populate('fromUserId', 'username avatarUrl')
      .populate('postId', 'title gameName coverImageUrl')
      .populate('commentId', 'content');
    
    console.log('Notification created:', {
      id: populatedNotification._id,
      type: populatedNotification.type,
      fromUser: populatedNotification.fromUserId?.username
    });
    
    res.status(201).json({
      success: true,
      data: populatedNotification,
      message: "Notification created successfully"
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to create notification" 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.userId; // From auth middleware
    
    console.log('Marking notification as read:', { notificationId, userId });
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ 
        error: "Invalid notification ID format" 
      });
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ 
        error: "Notification not found" 
      });
    }
    
    // Check if user owns this notification
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "You can only mark your own notifications as read" 
      });
    }
    
    notification.isRead = true;
    await notification.save();
    
    console.log('Notification marked as read:', notificationId);
    
    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to mark notification as read" 
    });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    console.log('Marking all notifications as read for user:', userId);
    
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    console.log('Marked notifications as read:', result.modifiedCount);
    
    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to mark all notifications as read" 
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.userId; // From auth middleware
    
    console.log('Deleting notification:', { notificationId, userId });
    
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ 
        error: "Invalid notification ID format" 
      });
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ 
        error: "Notification not found" 
      });
    }
    
    // Check if user owns this notification
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "You can only delete your own notifications" 
      });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    console.log('Notification deleted:', notificationId);
    
    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to delete notification" 
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    console.log('Getting notification stats for user:', userId);
    
    const [totalCount, unreadCount, typeStats] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
      Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    const stats = {
      totalCount,
      unreadCount,
      readCount: totalCount - unreadCount,
      typeBreakdown: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
    
    console.log('Notification stats:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Failed to get notification statistics" 
    });
  }
};

// Helper function to create notifications (for use in other controllers)
export const createNotificationHelper = async (notificationData) => {
  try {
    const { userId, fromUserId, type, title, message, postId, commentId, data } = notificationData;
    
    // Don't create notification if user is notifying themselves
    if (userId === fromUserId) {
      return null;
    }
    
    const notification = await Notification.create({
      userId,
      fromUserId,
      type,
      title,
      message,
      postId,
      commentId,
      data: data || {}
    });
    
    console.log('Helper: Notification created:', {
      id: notification._id,
      type: notification.type
    });
    
    return notification;
  } catch (error) {
    console.error('Error in createNotificationHelper:', error);
    return null;
  }
};

// Legacy function name for backward compatibility
export const getNotifybyUserId = getNotificationsByUserId;
