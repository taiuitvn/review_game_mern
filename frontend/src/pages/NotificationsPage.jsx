import React, { useState } from 'react';
import { useAuth } from '../hooks';
import { useNotifications } from '../hooks/useNotifications';
import NotificationsList from '../components/notifications/NotificationsList';
import { FaBell, FaFilter, FaRedo, FaBellSlash } from 'react-icons/fa';

const NotificationsPage = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    filterByType,
    filterUnreadOnly,
    refresh,
    clearError,
    fetchNotifications
  } = useNotifications();

  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <FaBellSlash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập để xem thông báo</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem các thông báo của mình.</p>
          <a 
            href="/login" 
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (type === 'all') {
      refresh();
    } else {
      filterByType(type);
    }
  };

  const handleUnreadToggle = () => {
    const newUnreadOnly = !showUnreadOnly;
    setShowUnreadOnly(newUnreadOnly);
    filterUnreadOnly(newUnreadOnly);
  };

  const notificationTypes = [
    { key: 'all', label: 'Tất cả' },
    { key: 'like', label: 'Lượt thích' },
    { key: 'comment', label: 'Bình luận' },
    { key: 'reply', label: 'Phản hồi' },
    { key: 'follow', label: 'Theo dõi' },
    { key: 'post_rating', label: 'Đánh giá' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBell className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                </p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaRedo className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaFilter className="w-4 h-4" />
                Lọc theo:
              </span>
              {notificationTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleFilterChange(type.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterType === type.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={handleUnreadToggle}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Chỉ hiện chưa đọc</span>
              </label>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <NotificationsList
          notifications={notifications}
          loading={loading}
          error={error}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotif}
          onMarkAllAsRead={markAllAsRead}
          unreadCount={unreadCount}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.hasPrevPage && fetchNotifications({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-lg ${
                  pagination.hasPrevPage
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Trước
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              
              <button
                onClick={() => pagination.hasNextPage && fetchNotifications({ page: pagination.page + 1 })}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-lg ${
                  pagination.hasNextPage
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;