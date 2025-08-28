import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import { FaStar, FaEye, FaHeart, FaBookmark } from 'react-icons/fa';

const AnimatedCard = ({ 
  review, 
  className = '',
  showStats = true,
  showRating = true,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link 
      to={`/review/${review._id}`}
      className={`group block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      <article className={`
        relative bg-white rounded-2xl shadow-md overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-2
        active:scale-[0.98] active:shadow-lg
        focus-within:ring-2 focus-within:ring-indigo-500
        ${isPressed ? 'scale-[0.98]' : ''}
        ${isHovered ? 'shadow-xl -translate-y-2' : ''}
      `}
      role="article"
      aria-label={`Review: ${review.title}`}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <LazyImage 
            src={review.coverImageUrl || review.gameImage} 
            alt={review.title}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          {showRating && review.rating && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300">
              <FaStar className="w-3 h-3" />
              {review.rating}
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0">
            <button 
              className="p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                // Handle like action
              }}
              aria-label="Thích bài viết"
              title="Thích"
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <button 
              className="p-2 bg-white/90 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                // Handle bookmark action
              }}
              aria-label="Lưu bài viết"
              title="Lưu"
            >
              <FaBookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {review.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {review.description || review.content?.substring(0, 100) + '...' || 'Không có mô tả'}
          </p>
          
          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {review.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {review.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{review.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Stats */}
          {showStats && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FaEye className="w-3 h-3" />
                  {review.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FaHeart className="w-3 h-3" />
                  {review.likes?.length || 0}
                </span>
              </div>
              
              {review.author && (
                <span className="text-indigo-600 font-medium">
                  {review.author.username || review.author.name}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Hover Border Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/50 rounded-2xl transition-colors duration-300 pointer-events-none" />
      </article>
    </Link>
  );
};

export default AnimatedCard;