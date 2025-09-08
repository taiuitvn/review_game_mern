  import api from './index';

// Get current user's notifications with pagination and filtering
export const getNotifications = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      unreadOnly = false,
      type = null
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (unreadOnly) {
      queryParams.append('unreadOnly', 'true');
    }
    
    if (type) {
      queryParams.append('type', type);
    }
    
    console.log('Fetching notifications with params:', params);
    
    const response = await api.get(`/notifications/me?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get notifications for a specific user (legacy function)
export const getNotificationsByUserId = async (userId) => {
  try {
    console.log('Fetching notifications for user:', userId);
    const response = await api.get(`/notifications/list/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    console.log('Creating notification:', notificationData);
    const response = await api.post('/notifications/create', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('Marking notification as read:', notificationId);
    const response = await api.put(`/notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    console.log('Marking all notifications as read');
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    console.log('Deleting notification:', notificationId);
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    console.log('Fetching notification statistics');
    const response = await api.get('/notifications/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

// Helper functions for creating specific types of notifications

// Create a like notification
export const createLikeNotification = async (postId, postOwnerId, postTitle) => {
  return createNotification({
    userId: postOwnerId,
    type: 'like',
    title: 'Bài viết được thích',
    message: `đã thích bài viết "${postTitle}" của bạn`,
    postId,
    data: { postTitle }
  });
};

// Create a comment notification
export const createCommentNotification = async (postId, postOwnerId, postTitle, commentContent) => {
  return createNotification({
    userId: postOwnerId,
    type: 'comment',
    title: 'Bình luận mới',
    message: `đã bình luận về bài viết "${postTitle}" của bạn`,
    postId,
    data: { 
      postTitle,
      commentPreview: commentContent.substring(0, 50) + (commentContent.length > 50 ? '...' : '')
    }
  });
};

// Create a reply notification
export const createReplyNotification = async (commentId, commentOwnerId, postTitle) => {
  return createNotification({
    userId: commentOwnerId,
    type: 'reply',
    title: 'Phản hồi bình luận',
    message: `đã phản hồi bình luận của bạn trong "${postTitle}"`,
    commentId,
    data: { postTitle }
  });
};

// Create a follow notification
export const createFollowNotification = async (followedUserId) => {
  return createNotification({
    userId: followedUserId,
    type: 'follow',
    title: 'Người theo dõi mới',
    message: 'đã bắt đầu theo dõi bạn',
    data: {}
  });
};

// Create a rating notification
export const createRatingNotification = async (postId, postOwnerId, postTitle, rating) => {
  return createNotification({
    userId: postOwnerId,
    type: 'post_rating',
    title: 'Đánh giá mới',
    message: `đã đánh giá ${rating} sao cho bài viết "${postTitle}" của bạn`,
    postId,
    data: { 
      postTitle,
      rating
    }
  });
};

// Real-time notification helpers (for future WebSocket integration)
export const subscribeToNotifications = (userId, callback) => {
  // Placeholder for WebSocket implementation
  console.log('WebSocket subscription for notifications not yet implemented');
  return () => console.log('Unsubscribing from notifications');
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  try {
    const stats = await getNotificationStats();
    // The backend returns { success: true, data: stats }, so we need to access stats.data.data
    return stats.data?.data?.unreadCount || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export default {
  getNotifications,
  getNotificationsByUserId,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  createLikeNotification,
  createCommentNotification,
  createReplyNotification,
  createFollowNotification,
  createRatingNotification,
  getUnreadNotificationCount
};