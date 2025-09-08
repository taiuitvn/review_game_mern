import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`min-w-[320px] max-w-md w-auto ${getBgColor(notification.type)} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              {notification.title && (
                <p className="text-sm font-medium text-gray-900 break-words">
                  {notification.title}
                </p>
              )}
              {notification.message && (
                <p className="text-sm text-gray-700 mt-1 break-words leading-relaxed">
                  {notification.message}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <button
                className="bg-white rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={() => removeNotification(notification.id)}
                aria-label="Close notification"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;