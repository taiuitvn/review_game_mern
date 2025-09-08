import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTrending } from '../hooks';
import ReviewListItem from '../components/reviews/ReviewListItem';
import PopularReviews from '../components/reviews/PopularReviews';
import Pagination from '../components/common/Pagination';
import { FaFire, FaArrowUp, FaClock, FaHeart, FaComment, FaTrophy, FaMedal, FaAward, FaCrown, FaRocket } from 'react-icons/fa';

// Safe Image Component to prevent infinite loading
const SafeImage = React.memo(({ src, alt, className, fallbackText = "" }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Base64 encoded SVG fallback image - memoized (no text)
  const fallbackSvg = useMemo(() => {
    if (typeof btoa === 'undefined') {
      // Fallback for environments without btoa - simple gradient
      return 'data:image/svg+xml;charset=utf-8,<svg width="400" height="240" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236366f1;stop-opacity:1" /><stop offset="100%" style="stop-color:%234f46e5;stop-opacity:1" /></linearGradient></defs><rect width="400" height="240" fill="url(%23grad)"/></svg>';
    }
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="400" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#grad)"/>
      </svg>`
    )}`;
  }, []);

  const handleError = React.useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSvg);
      setIsLoading(false);
    }
  }, [hasError, fallbackSvg]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (src && src !== imageSrc && !hasError) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    } else if (!src) {
      setImageSrc(fallbackSvg);
      setIsLoading(false);
      setHasError(false);
    }
  }, [src, imageSrc, hasError, fallbackSvg]);

  return (
    <div className={`relative ${className} bg-gray-200`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-gray-400">Đang tải...</div>
        </div>
      )}
      <img
        src={imageSrc || fallbackSvg}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
});

SafeImage.displayName = 'SafeImage';

const TrendingPage = () => {
  const { trendingPosts: reviews, loading, error, refetch } = useTrending();
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Refetch when time range changes
  React.useEffect(() => {
    refetch();
  }, [timeRange]);

  // Add debug logging
  console.log('TrendingPage: reviews:', reviews?.length || 0, 'loading:', loading, 'error:', error);

  // Sắp xếp theo trending score (likes + comments + views/100) - memoized for performance
  const sortedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      console.log('TrendingPage: No reviews to sort');
      return [];
    }
    
    // Limit processing to prevent performance issues
    const reviewsToProcess = reviews.slice(0, 50); // Only process top 50 reviews
    
    return reviewsToProcess.sort((a, b) => {
      const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
      const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
      const commentsA = Array.isArray(a.comments) ? a.comments.length : (a.comments || 0);
      const commentsB = Array.isArray(b.comments) ? b.comments.length : (b.comments || 0);
      const viewsA = typeof a.views === 'number' ? a.views : (a.views?.count || 0);
      const viewsB = typeof b.views === 'number' ? b.views : (b.views?.count || 0);
      const scoreA = likesA + commentsA + Math.floor(viewsA / 100);
      const scoreB = likesB + commentsB + Math.floor(viewsB / 100);
      return scoreB - scoreA;
    });
  }, [reviews]);

  const topThree = sortedReviews.slice(0, 3);
  const remainingReviews = sortedReviews.slice(3);
  
  // Pagination for remaining reviews
  const totalPages = Math.ceil(remainingReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return remainingReviews.slice(startIndex, endIndex);
  }, [remainingReviews, currentPage]);

  // Reset to first page when time range changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  // Reset to first page if current page exceeds total pages
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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

  if (error) return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 min-h-screen" style={{ position: 'relative' }}>
      {/* Suppress browser tooltips */}
      <style>{`
        [title=""], [title=""]:hover {
          position: relative;
        }
        [title=""]:hover::after {
          display: none !important;
        }
      `}</style>
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
          {topThree.length > 0 ? (
            topThree.map((review, index) => {
              // Defensive check to ensure review exists and has required properties
              if (!review || !review._id) {
                console.warn('Invalid review data:', review);
                return null;
              }
              
              const rankIcons = [FaTrophy, FaMedal, FaAward];
              const rankColors = [
                { bg: 'from-yellow-400 via-orange-500 to-red-500', text: 'text-yellow-600', shadow: 'shadow-yellow-200' },
                { bg: 'from-gray-300 via-slate-400 to-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-200' },
                { bg: 'from-amber-500 via-orange-600 to-red-600', text: 'text-amber-600', shadow: 'shadow-amber-200' }
              ];

              const RankIcon = rankIcons[index] || FaTrophy;
              const colors = rankColors[index] || rankColors[0];

              return (
              <Link 
                key={review._id} 
                to={`/review/${review._id}`}
                className={`block bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 group transform hover:-translate-y-2 ${colors.shadow} cursor-pointer`}
                title="" // Prevent default tooltip
              >
                {/* Rank Badge */}
                <div className={`relative h-56 bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden`}>

                  {/* Rank Icon */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-white bg-opacity-90 p-3 rounded-2xl shadow-lg">
                      <RankIcon className={`text-2xl ${colors.text}`} />
                    </div>
                  </div>

                  {/* Game Image */}
                  <SafeImage
                    src={review.gameImage || review.coverImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {review.avgRating !== undefined && review.avgRating > 0 
                            ? `${Math.round(review.avgRating)}` 
                            : review.rating 
                              ? `${review.rating}` 
                              : '0'
                          }
                          {review.totalRatings && review.totalRatings > 0 && (
                            <span className="ml-1 text-xs opacity-75">({review.totalRatings})</span>
                          )}
                        </span>
                        {/* Genre badge: strong contrast, no white-on-white */}
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                          {(review.genres && review.genres.length > 0) ? review.genres.join(', ') : (review.tags && review.tags.length > 0) ? review.tags.slice(0, 2).join(', ') : 'Game'}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl mb-1 text-white drop-shadow-sm">{String(review.title || 'Untitled').substring(0, 100)}</h3>
                      <p className="text-sm text-gray-200">{
                        String(
                          (review.author && (review.author.name || review.author.username))
                          || (review.authorId && typeof review.authorId === 'object' && (review.authorId.username || review.authorId.name))
                          || 'Anonymous'
                        ).substring(0, 50)
                      }</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 hover:text-gray-800 transition-colors" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {(() => {
                      const content = review.content || '';
                      const cleanContent = String(content).replace(/[<>]/g, ''); // Remove potential HTML tags
                      return cleanContent.length > 150 
                        ? cleanContent.substring(0, 150) + '...' 
                        : cleanContent || 'Không có mô tả';
                    })()}
                  </p>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-3 rounded-2xl text-center group hover:bg-red-100 transition-colors">
                      <FaHeart className="text-red-500 text-lg mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-bold text-red-700">{Array.isArray(review.likes) ? review.likes.length : (review.likes || 0)}</div>
                      <div className="text-xs text-red-600">Thích</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl text-center group hover:bg-blue-100 transition-colors">
                      <FaComment className="text-blue-500 text-lg mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-bold text-blue-700">{Array.isArray(review.comments) ? review.comments.length : (review.comments || 0)}</div>
                      <div className="text-xs text-blue-600">Bình luận</div>
                    </div>
                  </div>

                  {/* Time and Views */}
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="font-medium">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Không rõ ngày'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaArrowUp className="text-green-500" />
                      <span className="font-medium">{(typeof review.views === 'number' ? review.views : (review.views?.count || 0))} lượt xem</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }).filter(Boolean) // Remove any null values from invalid reviews
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFire className="text-5xl text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Chưa có bài review trending</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Hiện tại chưa có bài review nào đủ phổ biến để hiển thị trong top trending. Hãy thử thay đổi thời gian hoặc quay lại sau!</p>
            <Link
              to="/"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
            >
              <FaArrowUp className="" />
              Xem tất cả bài review
            </Link>
          </div>
        )}
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
            {paginatedReviews.length > 0 ? (
              <>
                {paginatedReviews.map((review, index) => (
                  <div key={review._id} className="relative">
                    {/* Rank Number */}
                    <div className="absolute -left-4 -top-4 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg z-10">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 4}
                    </div>
                    <ReviewListItem review={review} />
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="pt-8"
                  />
                )}
              </>
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