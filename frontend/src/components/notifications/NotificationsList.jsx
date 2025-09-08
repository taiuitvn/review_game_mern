import React from 'react';
import NotificationItem from './NotificationItem';
import { FaBell, FaSpinner } from 'react-icons/fa';

const NotificationsList = ({ 
  notifications, 
  loading, 
  error, 
  onMarkAsRead, 
  onDelete, 
  onMarkAllAsRead,
  unreadCount 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <FaSpinner className="animate-spin w-6 h-6 text-indigo-600" />
        <span className="ml-2">Đang tải thông báo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">Có lỗi xảy ra: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-indigo-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <FaBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Thông báo ({notifications.length})</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Đánh dấu tất cả đã đọc ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;