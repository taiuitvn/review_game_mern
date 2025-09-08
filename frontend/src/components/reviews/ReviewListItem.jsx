import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { FaBookmark, FaRegBookmark, FaHeart, FaComment, FaEye, FaStar } from 'react-icons/fa';
import { truncateText } from '../../utils/textUtils';

const ReviewListItem = ({ review }) => {
  // Debug logging to check review data
  console.log('ReviewListItem received review:', {
    id: review?._id,
    title: review?.title,
    fullReview: review
  });

  if (!review) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Review not found</p>
      </div>
    );
  }

  if (!review._id) {
    console.error('Review missing _id:', review);
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <p className="text-red-500">Review missing ID - cannot navigate</p>
        <p className="text-xs text-gray-600">Title: {review.title}</p>
      </div>
    );
  }

  return (
    <Link 
      to={`/review/${review._id}`}
      className="block bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={(e) => {
        if (!review._id) {
          e.preventDefault();
          console.error('Cannot navigate - review missing _id:', review);
          alert('Lỗi: Không thể mở bài review này. ID bị thiếu.');
          return false;
        }
        console.log('Navigating to review:', review._id);
      }}
    >
      <div className="flex items-start space-x-4">
        {review.coverImageUrl && (
          <img 
            src={review.coverImageUrl} 
            alt={review.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
            {review.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {truncateText(review.content, 200)}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <FaEye className="text-xs" />
                {review.views || 0} lượt xem
              </span>
              <span className="flex items-center gap-1">
                <FaHeart className="text-xs" />
                {review.likes?.length || 0} thích
              </span>
              <span className="flex items-center gap-1">
                <FaComment className="text-xs" />
                {Array.isArray(review.comments) ? review.comments.length : (review.comments || 0)} bình luận
              </span>
              {review.rating !== undefined && typeof review.rating === 'number' && (
                <span className="flex items-center gap-1">
                  <FaStar className="text-xs text-yellow-400" />
                  {Math.round(review.rating)} sao
                </span>
              )}
              {review.totalRatings !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="text-xs opacity-75">({review.totalRatings} đánh giá)</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {review.tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
              {review.tags?.length > 3 && (
                <span className="text-xs text-gray-400">+{review.tags.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ReviewListItem;
