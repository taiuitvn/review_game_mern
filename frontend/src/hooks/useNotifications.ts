import { useState, useEffect } from 'react';
import { Notification } from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Implement API call
      console.log('Marking notification as read:', notificationId);
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implement API call
      console.log('Marking all notifications as read');
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call
      setNotifications([]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
