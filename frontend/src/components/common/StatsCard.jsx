import React from 'react';
import { FaUsers, FaFileAlt, FaStar, FaTrophy, FaGamepad, FaChartLine } from 'react-icons/fa';

const StatsCard = ({ stats }) => {
  const defaultStats = {
    totalUsers: 12543,
    totalReviews: 2847,
    totalGames: 15632,
    avgRating: 8.2,
    topGames: ['The Witcher 3', 'Cyberpunk 2077', 'Elden Ring'],
    trendingTags: ['RPG', 'Action', 'Open World', 'Indie']
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartLine className="text-indigo-600" />
        Thống kê cộng đồng
      </h3>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
          <FaUsers className="text-blue-600 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{displayStats.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-blue-700">Thành viên</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
          <FaFileAlt className="text-green-600 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{displayStats.totalReviews.toLocaleString()}</div>
          <div className="text-sm text-green-700">Bài review</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
          <FaGamepad className="text-purple-600 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">{displayStats.totalGames.toLocaleString()}</div>
          <div className="text-sm text-purple-700">Game đã review</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
          <FaStar className="text-yellow-600 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-900">{displayStats.avgRating}</div>
          <div className="text-sm text-yellow-700">Đánh giá TB</div>
        </div>
      </div>

      {/* Top Games */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaTrophy className="text-orange-500" />
          Game được review nhiều nhất
        </h4>
        <div className="space-y-2">
          {displayStats.topGames.map((game, index) => (
            <div key={game} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{game}</span>
              </div>
              <div className="text-sm text-gray-500">
                {Math.floor(Math.random() * 100) + 50} reviews
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Tags */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaChartLine className="text-red-500" />
          Tags thịnh hành
        </h4>
        <div className="flex flex-wrap gap-2">
          {displayStats.trendingTags.map((tag, index) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium hover:from-red-200 hover:to-pink-200 transition-colors cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              #{tag}
              <span className="text-xs bg-red-200 text-red-800 px-1 rounded">
                {Math.floor(Math.random() * 50) + 10}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Community Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
        <h4 className="font-semibold text-gray-900 mb-2">🚀 Tham gia cộng đồng</h4>
        <p className="text-sm text-gray-600 mb-3">
          Chia sẻ cảm nhận về game yêu thích của bạn và kết nối với hàng nghìn game thủ khác!
        </p>
        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          Viết review ngay
        </button>
      </div>
    </div>
  );
};

export default StatsCard;
