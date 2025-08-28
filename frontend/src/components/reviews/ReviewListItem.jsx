import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBookmark, FaRegBookmark, FaHeart, FaComment, FaEye } from 'react-icons/fa';

const ReviewListItem = ({ review }) => {
  const { user, saveReview, unsaveReview, isReviewSaved } = useAuth();

  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Có thể chuyển hướng đến login hoặc hiển thị modal
      return;
    }

    if (isReviewSaved(review._id)) {
      unsaveReview(review._id);
    } else {
      saveReview(review._id);
    }
  };

  const handleLikeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic like/unlike sẽ được implement sau
    console.log('Toggle like for review:', review._id);
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link to={`/review/${review._id}`} className="flex items-start gap-4 flex-grow">
        <div className="relative flex-shrink-0">
          <img src={review.gameImage} alt={review.title} className="w-32 h-20 object-cover rounded-md" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
            {review.score}
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600">{review.title}</h3>
          <p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">{review.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-gray-500">
            <span>{review.genres?.join(', ')}</span>
            <span>by {review.author?.name}</span>
            <span className="flex items-center gap-1">
              <FaEye className="text-gray-400" />
              {review.likes?.length || 0}
            </span>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={handleSaveToggle}
          className={`p-2 rounded-full transition-colors ${
            user && isReviewSaved(review._id)
              ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
          }`}
          title={user && isReviewSaved(review._id) ? 'Bỏ lưu' : 'Lưu bài viết'}
        >
          {user && isReviewSaved(review._id) ? <FaBookmark /> : <FaRegBookmark />}
        </button>

        <button
          onClick={handleLikeToggle}
          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Thích bài viết"
        >
          <FaHeart />
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FaComment className="text-gray-400" />
          <span>{review.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewListItem;