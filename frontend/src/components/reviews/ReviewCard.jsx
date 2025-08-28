import React from 'react';
import { Link } from 'react-router-dom';

const ReviewCard = ({ review }) => {
  if (!review) {
    return null;
  }

  return (
    <Link 
      to={`/review/${review._id}`} 
      className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      <div className="relative">
        <img
          src={review.gameImage || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={review.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-indigo-600">
          {review.title}
        </h3>
        {review.author && (
          <p className="text-sm text-gray-500 mt-1">
            by {review.author.name || 'Unknown Author'}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <span>❤️ {review.likes?.length || 0}</span>
          <span>💬 {review.comments?.length || 0}</span>
          <span>👁️ {review.views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ReviewCard;