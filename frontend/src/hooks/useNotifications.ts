import { useState, useEffect, useCallback } from 'react';
// @ts-ignore - Using JS file with dynamic exports
import * as notificationAPI from '../api/notifications';

// Type definitions
interface Notification {
  _id: string;
  userId: string;
  fromUserId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  type: 'like' | 'comment' | 'reply' | 'follow' | 'post_rating' | 'mention';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  postId?: {
    _id: string;
    title: string;
    gameName: string;
    coverImageUrl?: string;
  };
  commentId?: string;
  data: {
    postTitle?: string;
    commentPreview?: string;
    rating?: number;
    [key: string]: any;
  };
}

interface Pagination {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
}

interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  typeBreakdown: {
    [key: string]: number;
  };
}

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}

// Response interfaces based on actual API responses
// Using ApiResponse from types/database.ts

interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;
  pagination: Pagination;
  stats: NotificationStats;
  
  // States
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotif: (notificationId: string) => Promise<boolean>;
  updateUnreadCount: () => Promise<void>;
  refresh: () => void;
  
  // Pagination
  loadNextPage: () => void;
  loadPrevPage: () => void;
  
  // Filtering
  filterByType: (type: string) => void;
  filterUnreadOnly: (unreadOnly?: boolean) => void;
  
  // Utilities
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0
  });
  const [stats, setStats] = useState<NotificationStats>({
    totalCount: 0,
    unreadCount: 0,
    readCount: 0,
    typeBreakdown: {}
  });

  // Fetch notifications with optional parameters
  const fetchNotifications = useCallback(async (params: GetNotificationsParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // @ts-ignore - API function exists in default export
      const response = await notificationAPI.getNotifications(params) as any;
      
      if (response.success) {
        setNotifications(response.data.notifications || response.data);
        setPagination(response.data.pagination || response.pagination || {
          page: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          totalCount: response.data.length || 0
        });
        setUnreadCount(response.data.unreadCount || response.unreadCount || 0);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    try {
      // @ts-ignore - API function exists in default export
      const response = await notificationAPI.getNotificationStats() as any;
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching notification stats:', err);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // @ts-ignore - API function exists in default export
      await notificationAPI.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err?.message || 'Failed to mark notification as read');
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // @ts-ignore - API function exists in default export
      await notificationAPI.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      
      return true;
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err?.message || 'Failed to mark all notifications as read');
      return false;
    }
  }, []);

  // Delete a notification
  const deleteNotif = useCallback(async (notificationId: string) => {
    try {
      // @ts-ignore - API function exists in default export
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err?.message || 'Failed to delete notification');
      return false;
    }
  }, [notifications]);

  // Get unread count only
  const updateUnreadCount = useCallback(async () => {
    try {
      // @ts-ignore - API function exists in default export
      const count = await notificationAPI.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error getting unread count:', err);
    }
  }, []);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (pagination.hasNextPage && !loading) {
      fetchNotifications({ page: pagination.page + 1 });
    }
  }, [pagination, loading, fetchNotifications]);

  // Load previous page
  const loadPrevPage = useCallback(() => {
    if (pagination.hasPrevPage && !loading) {
      fetchNotifications({ page: pagination.page - 1 });
    }
  }, [pagination, loading, fetchNotifications]);

  // Filter notifications by type
  const filterByType = useCallback((type: string) => {
    fetchNotifications({ type, page: 1 });
  }, [fetchNotifications]);

  // Filter unread only
  const filterUnreadOnly = useCallback((unreadOnly: boolean = true) => {
    fetchNotifications({ unreadOnly, page: 1 });
  }, [fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications({ page: 1 });
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  // Periodic refresh for unread count (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      updateUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [updateUnreadCount]);

  // Also update on window focus to ensure fresh data
  useEffect(() => {
    const handleFocus = () => {
      updateUnreadCount();
      fetchNotifications({ page: 1 });
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateUnreadCount, fetchNotifications]);

  return {
    // Data
    notifications,
    unreadCount,
    pagination,
    stats,
    
    // States
    loading,
    error,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    updateUnreadCount,
    refresh,
    
    // Pagination
    loadNextPage,
    loadPrevPage,
    
    // Filtering
    filterByType,
    filterUnreadOnly,
    
    // Utilities
    clearError: () => setError(null)
  };
};

export default useNotifications;
