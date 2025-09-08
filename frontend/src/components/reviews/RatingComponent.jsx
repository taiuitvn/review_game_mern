import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { ratePost, getUserRatingForPost, getPostRatings } from '../../api/rating';
import { useAuth } from '../../hooks';
import { useNotification } from '../../contexts/NotificationContext';

const RatingComponent = ({ postId, onRatingUpdate }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchRatings();
    }
  }, [postId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      
      // Fetch post ratings (average and total)
      const ratingsData = await getPostRatings(postId);
      setAverageRating(ratingsData.averageRating || 0);
      setTotalRatings(ratingsData.totalRatings || 0);
      
      // Fetch user's rating if logged in
      if (user) {
        try {
          const userRatingData = await getUserRatingForPost(postId);
          setUserRating(userRatingData.value || 0);
        } catch (error) {
          // User hasn't rated yet, that's fine
          setUserRating(0);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      showNotification('Bạn cần đăng nhập để đánh giá bài viết.', 'warning');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      await ratePost(postId, rating);
      
      // Update local state
      const oldRating = userRating;
      setUserRating(rating);
      
      // Recalculate average rating
      let newTotal = totalRatings;
      let newSum = averageRating * totalRatings;
      
      if (oldRating === 0) {
        // New rating
        newTotal += 1;
        newSum += rating;
      } else {
        // Update existing rating
        newSum = newSum - oldRating + rating;
      }
      
      const newAverage = newTotal > 0 ? newSum / newTotal : 0;
      setAverageRating(newAverage);
      setTotalRatings(newTotal);
      
      showNotification('Cảm ơn bạn đã đánh giá bài viết!', 'success');
      
      // Notify parent component if callback provided
      if (onRatingUpdate) {
        onRatingUpdate({
          userRating: rating,
          averageRating: newAverage,
          totalRatings: newTotal
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      showNotification('Không thể gửi đánh giá. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, size = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <button
          key={i}
          onClick={interactive ? () => handleRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          disabled={!interactive || isSubmitting}
          className={`${
            interactive
              ? 'hover:scale-110 transition-transform cursor-pointer'
              : 'cursor-default'
          } ${size} ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          } ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isFilled ? <FaStar /> : <FaRegStar />}
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
      <div className="space-y-3">
        {/* Average Rating Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-yellow-600">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="mx-1">•</span>
            <span>{totalRatings} đánh giá</span>
          </div>
        </div>

        {/* User Rating Section */}
        {user && (
          <div className="border-t border-yellow-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {userRating > 0 ? 'Đánh giá của bạn:' : 'Đánh giá bài viết này:'}
              </span>
              {userRating > 0 && (
                <span className="text-xs text-gray-500">
                  {userRating}/5 sao
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {renderStars(hoveredRating || userRating, true, 'text-xl')}
            </div>
            {hoveredRating > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {hoveredRating === 1 && 'Rất tệ'}
                {hoveredRating === 2 && 'Tệ'}
                {hoveredRating === 3 && 'Bình thường'}
                {hoveredRating === 4 && 'Tốt'}
                {hoveredRating === 5 && 'Xuất sắc'}
              </div>
            )}
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <div className="border-t border-yellow-200 pt-3">
            <p className="text-sm text-gray-600">
              <span>Đăng nhập để đánh giá bài viết này</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingComponent;