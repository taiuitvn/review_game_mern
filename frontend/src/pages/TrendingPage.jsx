import React, { useState, useEffect, useMemo } from 'react';
import mock from '../utils/mockData.json';
import { Link } from 'react-router-dom';
import ReviewListItem from '../components/reviews/ReviewListItem';
import PopularReviews from '../components/reviews/PopularReviews';
import { FaFire, FaArrowUp, FaClock, FaHeart, FaComment, FaTrophy, FaMedal, FaAward, FaCrown, FaRocket } from 'react-icons/fa';

// Dữ liệu từ JSON
const mockTrendingReviews = mock.trendingReviews;

const TrendingPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d

  useEffect(() => {
    // Giả lập việc fetch data
    setTimeout(() => {
      setReviews(mockTrendingReviews);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  // Sắp xếp theo trending score (likes + comments + views/100)
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const scoreA = a.likes.length + a.comments.length + Math.floor(a.views / 100);
      const scoreB = b.likes.length + b.comments.length + Math.floor(b.views / 100);
      return scoreB - scoreA;
    });
  }, [reviews]);

  // Lấy top 3 bài viết nổi bật nhất
  const topThree = sortedReviews.slice(0, 3);
  const remainingReviews = sortedReviews.slice(3);

  if (loading) return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <FaFire className="text-6xl text-orange-500 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải bài review trending...</h2>
            <p className="text-gray-600">Chúng tôi đang tìm những bài viết hot nhất cho bạn</p>
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-4 rounded-2xl shadow-xl ring-1 ring-white/20">
                <FaRocket className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">🔥 Trending</h1>
                <p className="text-xl text-white text-opacity-90">Bài review đang hot nhất cộng đồng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <FaFire className="text-6xl text-white animate-pulse" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <FaRocket className="text-4xl text-white animate-bounce" />
        </div>
      </div>

      {/* Time Range Toolbar - tách khỏi header để đỡ vướng tầm nhìn */}
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md p-3 sm:p-4 -mt-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <FaClock className="text-indigo-500" />
            <span>Thời gian</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '24h', label: '24h', icon: FaClock },
              { value: '7d', label: '7 ngày', icon: FaArrowUp },
              { value: '30d', label: '30 ngày', icon: FaFire }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 min-w-[110px] sm:min-w-[120px] text-sm font-bold rounded-xl transition-all duration-300 ${
                  timeRange === range.value
                    ? 'bg-indigo-600 text-white shadow-md border-2 border-indigo-500'
                    : 'text-gray-700 bg-white hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <range.icon className="text-sm" />
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

      {/* Top 3 Featured Reviews */}
      <section className="-mt-8 relative z-10 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <FaCrown className="text-yellow-500" />
            Top Trending
            <FaCrown className="text-yellow-500" />
          </h2>
          <p className="text-gray-600 text-lg">Những bài review được yêu thích nhất</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {topThree.map((review, index) => {
            const rankIcons = [FaTrophy, FaMedal, FaAward];
            const rankColors = [
              { bg: 'from-yellow-400 via-orange-500 to-red-500', text: 'text-yellow-600', shadow: 'shadow-yellow-200' },
              { bg: 'from-gray-300 via-slate-400 to-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-200' },
              { bg: 'from-amber-500 via-orange-600 to-red-600', text: 'text-amber-600', shadow: 'shadow-amber-200' }
            ];

            const RankIcon = rankIcons[index];
            const colors = rankColors[index];

            return (
              <div key={review._id} className={`bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 group transform hover:-translate-y-2 ${colors.shadow}`}>
                {/* Rank Badge */}
                <div className={`relative h-56 bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden`}>

                  {/* Rank Icon */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-white bg-opacity-90 p-3 rounded-2xl shadow-lg">
                      <RankIcon className={`text-2xl ${colors.text}`} />
                    </div>
                  </div>

                  {/* Game Image */}
                  <img
                    src={review.gameImage}
                    alt={review.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {review.score}/10
                        </span>
                        {/* Genre badge: strong contrast, no white-on-white */}
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                          {(review.genres && review.genres.length > 0) ? review.genres.join(', ') : 'Unknown Genre'}
                        </span>
                        {review.platforms && review.platforms.length > 0 && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                            {review.platforms.join(', ')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xl mb-1 text-white drop-shadow-sm">{review.title}</h3>
                      <p className="text-sm text-gray-200">{review.author.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <Link to={`/review/${review._id}`} className="block">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 hover:text-gray-800 transition-colors" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {review.description}
                    </p>
                  </Link>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-3 rounded-2xl text-center group hover:bg-red-100 transition-colors">
                      <FaHeart className="text-red-500 text-lg mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-bold text-red-700">{review.likes.length}</div>
                      <div className="text-xs text-red-600">Likes</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl text-center group hover:bg-blue-100 transition-colors">
                      <FaComment className="text-blue-500 text-lg mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-bold text-blue-700">{review.comments.length}</div>
                      <div className="text-xs text-blue-600">Comments</div>
                    </div>
                  </div>

                  {/* Time and Views */}
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="font-medium">{review.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaArrowUp className="text-green-500" />
                      <span className="font-medium">{review.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Trending Reviews */}
      <section className="mb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl">
              <FaFire className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Tất cả bài trending</h2>
              <p className="text-gray-600">Những bài review đang được cộng đồng quan tâm</p>
            </div>
          </div>

          <div className="space-y-6">
            {remainingReviews.length > 0 ? (
              remainingReviews.map((review, index) => (
                <div key={review._id} className="relative group">
                  {/* Rank Number */}
                  <div className="absolute -left-4 -top-4 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 z-10">
                    {index + 4}
                  </div>
                  <div className="transform group-hover:scale-[1.02] transition-all duration-300">
                    <ReviewListItem review={review} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFire className="text-5xl text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">Không có bài review trending nào khác</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Các bài review hàng đầu đã được hiển thị ở trên. Hãy quay lại sau để xem thêm!</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setTimeRange('24h')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaClock className="inline mr-2" />
                    Xem 24h
                  </button>
                  <button
                    onClick={() => setTimeRange('7d')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaArrowUp className="inline mr-2" />
                    Xem 7 ngày
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default TrendingPage;