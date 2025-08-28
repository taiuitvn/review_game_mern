import React from 'react';
import { Link } from 'react-router-dom';

const PopularReviews = ({ reviews }) => {
  
  const popular = [...reviews].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-red-600">Popular Reviews</h3>
      <ol className="space-y-4">
        {popular.map((review, index) => (
          <li key={review._id} className="flex items-start gap-4">
            <span className="text-2xl font-bold text-gray-300">0{index + 1}</span>
            <div>
              <p className="text-xs text-gray-500">{review.timestamp}</p>
              <Link to={`/review/${review._id}`} className="font-bold text-gray-800 hover:text-indigo-600 leading-tight">
                {review.title}
              </Link>
              <p className="text-sm text-gray-500 mt-1">👁️ {review.likes.length}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default PopularReviews;