import { useState, useEffect } from 'react';
import { Notification, User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  getNotificationById: (notificationId: string) => Notification | undefined;
  createNotification: (notificationData: Omit<Notification, '_id' | 'isRead' | 'createdAt' | 'sender' | 'post' | 'comment'>) => Notification;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  getUnreadCount: (userId: string) => number;
  getUnreadNotifications: (userId: string) => Notification[];
}

export const useNotifications = (userId?: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        let filteredNotifications = mockDB.notifications;
        
        // Filter by userId if provided (get notifications for specific user)
        if (userId) {
          filteredNotifications = mockDB.notifications.filter(notif => notif.recipientId === userId);
        }

        // Populate notifications with sender and post info
        const notificationsWithDetails: Notification[] = filteredNotifications.map(notif => {
          const sender = mockDB.users.find(user => user._id === notif.senderId) as User;
          const post = mockDB.posts.find(post => post._id === notif.postId);
          const comment = mockDB.comments.find(comment => comment._id === notif.commentId);

          return {
            ...notif,
            type: notif.type as 'comment' | 'like' | 'likeComment', // Type assertion for mock data
            sender: sender ? {
              id: sender._id,
              name: sender.username,
              avatar: sender.avatarUrl
            } : undefined,
            post: post ? {
              id: post._id,
              title: post.title
            } : undefined,
            comment: comment ? {
              id: comment._id,
              content: comment.content
            } : undefined
          };
        });

        // Sort by createdAt (newest first)
        notificationsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setNotifications(notificationsWithDetails);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
        setError(errorMessage);
        setLoading(false);
      }
    }, 300);
  }, [userId]);

  const getNotificationById = (notificationId: string): Notification | undefined => {
    return notifications.find(notif => notif._id === notificationId);
  };

  const createNotification = (notificationData: Omit<Notification, '_id' | 'isRead' | 'createdAt' | 'sender' | 'post' | 'comment'>): Notification => {
    const newNotification: Notification = {
      _id: `notif_${Date.now()}`,
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Add sender and post details
    const sender = mockDB.users.find(user => user._id === notificationData.senderId) as User;
    const post = mockDB.posts.find(post => post._id === notificationData.postId);
    const comment = mockDB.comments.find(comment => comment._id === notificationData.commentId);

    const notificationWithDetails: Notification = {
      ...newNotification,
      sender: sender ? {
        id: sender._id,
        name: sender.username,
        avatar: sender.avatarUrl
      } : undefined,
      post: post ? {
        id: post._id,
        title: post.title
      } : undefined,
      comment: comment ? {
        id: comment._id,
        content: comment.content
      } : undefined
    };

    setNotifications(prev => [notificationWithDetails, ...prev]);
    return notificationWithDetails;
  };

  const markAsRead = (notificationId: string): void => {
    setNotifications(prev => prev.map(notif => 
      notif._id === notificationId 
        ? { ...notif, isRead: true }
        : notif
    ));
  };

  const markAllAsRead = (userId: string): void => {
    setNotifications(prev => prev.map(notif => 
      notif.recipientId === userId 
        ? { ...notif, isRead: true }
        : notif
    ));
  };

  const deleteNotification = (notificationId: string): void => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const getUnreadCount = (userId: string): number => {
    return notifications.filter(notif => 
      notif.recipientId === userId && !notif.isRead
    ).length;
  };

  const getUnreadNotifications = (userId: string): Notification[] => {
    return notifications.filter(notif => 
      notif.recipientId === userId && !notif.isRead
    );
  };

  return {
    notifications,
    loading,
    error,
    getNotificationById,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    getUnreadNotifications
  };
};
