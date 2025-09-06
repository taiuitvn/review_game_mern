import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import usePaginatedPosts from '../hooks/usePaginatedPosts';
import { getAllUsers } from '../api/users';
import LoginPromptModal from '../components/common/LoginPromptModal';
import ReviewListItem from '../components/reviews/ReviewListItem';
import StatsCard from '../components/common/StatsCard';
import Pagination from '../components/common/Pagination';
import { FaArrowRight, FaGamepad } from 'react-icons/fa';


const genreList = ['All', 'Action', 'RPG', 'Adventure', 'Indie'];

const HomePage = () => {
  const { user } = useAuth();
  const { 
    posts: reviewsData = [], 
    loading, 
    currentPage, 
    totalPages, 
    setPage 
  } = usePaginatedPosts({ limit: 12 });
  const [activeGenre, setActiveGenre] = useState('All');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [communityStats, setCommunityStats] = useState(null);

  // Ensure reviews is always an array
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  console.log('HomePage reviews data:', { reviewsData, reviews, loading });

  
  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    if (activeGenre === 'All') {
      return reviews;
    }
    return reviews.filter(review => review.tags?.includes(activeGenre));
  }, [reviews, activeGenre]);

  const featuredReview = reviews && reviews.length > 0 ? reviews[0] : null;
  const popularReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    return [...reviews]
      .sort((a, b) => {
        const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
        const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
        return likesB - likesA;
      })
      .slice(0, 4);
  }, [reviews]);

  const handleProtectedAction = (title, message) => {
    setModalContent({ title, message });
    setShowLoginModal(true);
  };

  // Compute community stats from API data
  React.useEffect(() => {
    let canceled = false;
    const computeStats = async () => {
      try {
        const usersResp = await getAllUsers().catch(() => ({ data: [] }));
        const usersData = Array.isArray(usersResp?.data) ? usersResp.data : (usersResp?.data?.data || []);

        const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
        const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

        // Unique games approximation: unique titles
        const uniqueTitles = new Set((reviews || []).map(r => r.title || ''));
        const totalGames = Array.from(uniqueTitles).filter(Boolean).length;

        // Average rating if present
        const ratings = (reviews || []).map(r => typeof r.rating === 'number' ? r.rating : null).filter(v => v !== null);
        const avgRating = ratings.length ? (ratings.reduce((a, b) => a + (b || 0), 0) / ratings.length).toFixed(1) : '0.0';

        // Top games by likes (use titles)
        const topGames = [...(reviews || [])]
          .sort((a, b) => (Array.isArray(b.likes) ? b.likes.length : (b.likes || 0)) - (Array.isArray(a.likes) ? a.likes.length : (a.likes || 0)))
          .slice(0, 3)
          .map(r => r.title)
          .filter(Boolean);

        // Trending tags by frequency
        const tagFreq = new Map();
        (reviews || []).forEach(r => {
          (r.tags || []).forEach(t => {
            const key = String(t).toLowerCase();
            tagFreq.set(key, (tagFreq.get(key) || 0) + 1);
          });
        });
        const trendingTags = Array.from(tagFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag]) => tag);

        if (!canceled) {
          setCommunityStats({ totalUsers, totalReviews, totalGames, avgRating, topGames, trendingTags });
        }
      } catch {
        if (!canceled) setCommunityStats(null);
      }
    };
    computeStats();
    return () => { canceled = true; };
  }, [reviews]);

  if (loading) {
    console.log('HomePage: Loading state');
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <FaGamepad className="text-6xl text-indigo-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải nội dung...</h2>
              <p className="text-gray-600">Chúng tôi đang chuẩn bị những bài review tuyệt vời cho bạn</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('HomePage: Rendering with', reviews?.length || 0, 'reviews');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              GameHub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Nơi chia sẻ cảm nhận và khám phá thế giới game
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/create-review"
                  className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ✍️ Viết Review
                </Link>
              ) : (
                <button
                  onClick={() => handleProtectedAction(
                    'Đăng nhập để viết review',
                    'Bạn cần đăng nhập để có thể tạo và chia sẻ bài review về game yêu thích của mình.'
                  )}
                  className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ✍️ Viết Review
                </button>
              )}
              <Link
                to="/trending"
                className="border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
              >
                🔥 Khám phá
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-12">
            {}
            {featuredReview ? (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Nổi bật</h2>
                </div>
                <div className="relative group rounded-2xl overflow-hidden text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">
                  <img src={featuredReview.coverImageUrl || featuredReview.gameImage || '/placeholder-game.jpg'} alt={featuredReview.title} className="w-full h-96 object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-game.jpg'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 border-white shadow-lg transform group-hover:scale-110 transition-transform">
                      <span className="text-2xl">{typeof featuredReview.rating === 'number' ? featuredReview.rating : (Array.isArray(featuredReview.likes) ? featuredReview.likes.length : (featuredReview.likes || 0))}</span>
                      <span className="text-xs tracking-wider">SCORE</span>
                    </div>
                    <div className="mt-16">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(featuredReview.tags || []).map(tag => (
                          <span key={tag} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
                        <Link to={`/review/${featuredReview._id}`} className="hover:text-yellow-300 transition-colors">
                          {featuredReview.title}
                        </Link>
                      </h2>
                      <p className="text-gray-200 text-lg leading-relaxed max-w-2xl">
                        {featuredReview.description || (featuredReview.content ? String(featuredReview.content).slice(0, 140) + '…' : '')}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="mb-6">
                    <FaGamepad className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có bài review nào</h3>
                    <p className="text-gray-500">Hãy là người đầu tiên chia sẻ review về game yêu thích!</p>
                  </div>
                  {user ? (
                    <Link
                      to="/create-review"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      ✍️ Viết review đầu tiên
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleProtectedAction(
                        'Đăng nhập để viết review',
                        'Bạn cần đăng nhập để có thể tạo và chia sẻ bài review về game yêu thích của mình.'
                      )}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      ✍️ Viết review đầu tiên
                    </button>
                  )}
                </div>
              </section>
            )}

            {}
            <section>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                  {genreList.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setActiveGenre(genre)}
                      className={`py-2 px-6 text-sm font-semibold transition-all duration-300 rounded-full ${
                        activeGenre === genre
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {filteredReviews.length > 0 ? (
                  <>
                    {filteredReviews.map((review) => (
                      <ReviewListItem key={review._id} review={review} />
                    ))}
                    
                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      className="pt-8"
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào trong thể loại này.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                      <Link
                        to="/create-review"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        ✍️ Viết bài đầu tiên
                      </Link>
                    </div>


                  </div>
                )}
              </div>
            </section>
          </div>

          {}
          <aside className="lg:col-span-1 space-y-8">
            {}
            <StatsCard stats={communityStats || undefined} />

            {}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <h3 className="text-lg font-bold">Phổ biến nhất</h3>
                </div>
                <p className="text-indigo-100 text-sm">Bài viết được yêu thích nhiều nhất</p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {popularReviews.map((review, index) => (
                    <li key={review._id} className="group">
                      <Link to={`/review/${review._id}`} className="flex items-start gap-4 hover:bg-gray-50 p-3 rounded-xl transition-all duration-300">
                        <div className="relative flex-shrink-0">
                          <img src={review.gameImage || review.coverImageUrl || 'https://via.placeholder.com/160x120?text=No+Image'} alt={review.title} className="w-16 h-12 object-cover rounded-lg" />
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 leading-tight transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                            {review.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{
                              (review.author && (review.author.name || review.author.username))
                                || (review.authorId && typeof review.authorId === 'object' && review.authorId.username)
                                || 'Anonymous'
                            }</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              ❤️ {Array.isArray(review.likes) ? review.likes.length : (review.likes || 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{reviews.length}+</div>
                <div className="text-green-100 text-sm mb-4">Bài review</div>
                <Link
                  to="/create-review"
                  className="bg-white text-green-600 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-block"
                >
                  ✍️ Tham gia
                </Link>
              </div>
            </div>

            {}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Khám phá</h3>
              <div className="space-y-3">
                <Link
                  to="/trending"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🔥</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-orange-600">Trending</div>
                    <div className="text-sm text-gray-500">Bài viết hot</div>
                  </div>
                </Link>

                <Link
                  to="/search"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600">Tìm kiếm</div>
                    <div className="text-sm text-gray-500">Khám phá game</div>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
};

export default HomePage;
