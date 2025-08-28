import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, usePosts } from '../hooks';
import LoginPromptModal from '../components/common/LoginPromptModal';
import ReviewListItem from '../components/reviews/ReviewListItem';
import StatsCard from '../components/common/StatsCard';
import { FaArrowRight, FaGamepad } from 'react-icons/fa';


const genreList = ['All', 'Action', 'RPG', 'Adventure', 'Indie'];

const HomePage = () => {
  const { user } = useAuth();
  const { posts: reviews = [], loading } = usePosts();
  const [activeGenre, setActiveGenre] = useState('All');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  
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
    return [...reviews].sort((a, b) => b.likes.length - a.likes.length).slice(0, 4);
  }, [reviews]);

  const handleProtectedAction = (title, message) => {
    setModalContent({ title, message });
    setShowLoginModal(true);
  };

  if (loading) return (
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
            {featuredReview && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-900">Nổi bật</h2>
                </div>
                <div className="relative group rounded-2xl overflow-hidden text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">
                  <img src={featuredReview.coverImageUrl} alt={featuredReview.title} className="w-full h-96 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 border-white shadow-lg transform group-hover:scale-110 transition-transform">
                      <span className="text-2xl">{featuredReview.rating}</span>
                      <span className="text-xs tracking-wider">SCORE</span>
                    </div>
                    <div className="mt-16">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {featuredReview.tags?.map(tag => (
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
                        {featuredReview.description}
                      </p>
                    </div>
                  </div>
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
                  filteredReviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                      <ReviewListItem review={review} />
                    </div>
                  ))
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
            <StatsCard />

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
                          <img src={review.gameImage} alt={review.title} className="w-16 h-12 object-cover rounded-lg" />
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 leading-tight transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                            {review.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{review.author.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              ❤️ {review.likes.length}
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
