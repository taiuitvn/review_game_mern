import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUser, FaClock } from 'react-icons/fa';
import { getAllPosts } from '../../api/reviews';
import { truncateText } from '../../utils/textUtils';

const SuggestedReviews = ({ currentReviewId, gameTags, authorId }) => {
  const [suggestedReviews, setSuggestedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedReviews = async () => {
      try {
        setLoading(true);
        const response = await getAllPosts({ limit: 6 });
        const allPosts = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray(response.data.data) ? response.data.data : []);
        
        // Filter out current review and get 3 random suggestions
        const filtered = allPosts.filter(post => post._id !== currentReviewId);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setSuggestedReviews(shuffled.slice(0, 3));
      } catch (error) {
        console.error('Error fetching suggested reviews:', error);
        setSuggestedReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedReviews();
  }, [currentReviewId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          💡 Bài viết liên quan
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4 p-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        💡 Bài viết liên quan
      </h3>

      <div className="space-y-4">
        {suggestedReviews.map(review => (
          <Link
            key={review._id}
            to={`/review/${review._id}`}
            className="block group"
          >
            <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group-hover:border-gray-200">
              {/* Game Image */}
              <div className="flex-shrink-0">
                <img
                  src={review.coverImageUrl || review.gameImage || 'https://via.placeholder.com/64x64?text=Game'}
                  alt={review.gameName || review.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                  {review.title}
                </h4>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {truncateText(review.content, 100) || review.description || 'Không có mô tả'}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUser />
                    <span>{review.author?.name || review.author?.username || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {(review.avgRating !== undefined && review.avgRating > 0) ? (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{review.avgRating}</span>
                      {review.totalRatings && (
                        <span className="text-xs text-gray-400">({review.totalRatings})</span>
                      )}
                    </div>
                  ) : review.rating ? (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{review.rating}</span>
                    </div>
                  ) : null}
                </div>

                {/* Tags */}
                <div className="flex gap-1 mt-2">
                  {review.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {review.tags.length > 2 && (
                    <span className="text-xs text-gray-400">+{review.tags.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Score Badge */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {review.avgRating !== undefined && review.avgRating > 0 
                    ? `${Math.round(review.avgRating)}`
                    : `${review.rating || 0}`
                  }
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View more button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to="/trending"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center block"
        >
          Xem thêm bài viết
        </Link>
      </div>
    </div>
  );
};

export default SuggestedReviews;
