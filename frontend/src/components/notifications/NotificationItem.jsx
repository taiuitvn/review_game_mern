import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaReply, FaUserPlus, FaStar, FaCheck, FaTimes } from 'react-icons/fa';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const { _id, type, title, message, isRead, createdAt, fromUserId, postId, data } = notification;

  const getIcon = () => {
    const icons = {
      like: <FaHeart className="w-4 h-4 text-red-500" />,
      comment: <FaComment className="w-4 h-4 text-blue-500" />,
      reply: <FaReply className="w-4 h-4 text-green-500" />,
      follow: <FaUserPlus className="w-4 h-4 text-purple-500" />,
      post_rating: <FaStar className="w-4 h-4 text-yellow-500" />
    };
    return icons[type] || icons.comment;
  };

  const timeAgo = () => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60));
    return diff < 1 ? 'Vừa xong' : diff < 24 ? `${diff} giờ trước` : `${Math.floor(diff/24)} ngày trước`;
  };

  return (
    <div className={`p-3 border-b hover:bg-gray-50 ${!isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-sm text-gray-600">{message}</p>
              {data?.postTitle && (
                <Link to={`/review/${postId?._id || postId}`} className="text-xs text-blue-600 hover:underline">
                  📝 {data.postTitle}
                </Link>
              )}
            </div>
            <span className="text-xs text-gray-500">{timeAgo()}</span>
          </div>
          <div className="flex space-x-2 mt-2">
            {!isRead && (
              <button onClick={() => onMarkAsRead(_id)} className="text-xs text-blue-600 hover:underline flex items-center">
                <FaCheck className="w-3 h-3 mr-1" /> Đánh dấu đã đọc
              </button>
            )}
            <button onClick={() => onDelete(_id)} className="text-xs text-red-600 hover:underline flex items-center">
              <FaTimes className="w-3 h-3 mr-1" /> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;