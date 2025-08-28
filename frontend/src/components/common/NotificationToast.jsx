import React, { useEffect, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';

const NotificationToast = () => {
  const { notifications, removeNotification, markAsRead } = useNotification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, 3)); // Show max 3 notifications
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'like':
        return <FaHeart className="text-red-500" />;
      case 'comment':
        return <FaComment className="text-blue-500" />;
      case 'follow':
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-blue-50 border-blue-200';
      case 'follow':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map(notification => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ${
            getBackgroundColor(notification.type)
          } ${notification.isRead ? 'opacity-75' : 'opacity-100'}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="text-sm text-indigo-600 hover:text-indigo-500 mt-2 font-medium"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => {
                markAsRead(notification.id);
                removeNotification(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
