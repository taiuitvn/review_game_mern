import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReviewListItem from '../components/reviews/ReviewListItem';
import { FaSearch, FaGamepad, FaUser, FaFilter, FaSort, FaTimes, FaStar, FaCalendar, FaFire, FaMicrophone, FaUsers } from 'react-icons/fa';
import mock from '../utils/mockData.json';
import { searchGames } from '../api/rawgApi';

// Dữ liệu mock từ JSON
const mockSearchResults = mock.search;

const SearchPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ reviews: [], games: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    genre: 'all',
    platform: 'all',
    rating: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Lấy search term từ URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Tìm kiếm games từ RAWG API
      const gamesResponse = await searchGames(query);
      const rawgGames = gamesResponse.data.results || [];
      
      // Chuyển đổi dữ liệu RAWG sang format của app
      const formattedGames = rawgGames.map(game => ({
        id: game.id,
        name: game.name,
        image: game.background_image,
        rating: game.rating || 0,
        genres: game.genres?.map(g => g.name) || [],
        platforms: game.platforms?.map(p => p.platform.name) || [],
        released: game.released,
        description: game.description_raw || 'Không có mô tả'
      }));

      // Kết hợp với dữ liệu mock cho reviews và users
      setResults({
        reviews: mockSearchResults.reviews.filter(review => 
          review.title.toLowerCase().includes(query.toLowerCase()) ||
          review.game.toLowerCase().includes(query.toLowerCase())
        ),
        games: formattedGames,
        users: mockSearchResults.users.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase())
        )
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      // Fallback về dữ liệu mock nếu API lỗi
      setResults(mockSearchResults);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
      // Update URL
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Lọc và sắp xếp kết quả
  const filteredResults = useMemo(() => {
    let filtered = { ...results };

    // Áp dụng bộ lọc cho reviews
    if (filters.genre !== 'all') {
      filtered.reviews = filtered.reviews.filter(review => 
        review.genre && review.genre.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }
    
    if (filters.platform !== 'all') {
      filtered.reviews = filtered.reviews.filter(review => 
        review.platform && review.platform.toLowerCase().includes(filters.platform.toLowerCase())
      );
    }
    
    if (filters.rating !== 'all') {
      const minRating = parseInt(filters.rating);
      filtered.reviews = filtered.reviews.filter(review => 
        review.score >= minRating
      );
    }

    // Sắp xếp
    if (sortBy === 'rating') {
      filtered.reviews.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'newest') {
      filtered.reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'popular') {
      filtered.reviews.sort((a, b) => b.likes.length - a.likes.length);
    }

    return filtered;
  }, [results, sortBy, filters]);

  const tabs = [
    { id: 'all', label: 'Tất cả', count: filteredResults.reviews.length + filteredResults.games.length + filteredResults.users.length },
    { id: 'reviews', label: 'Reviews', count: filteredResults.reviews.length },
    { id: 'games', label: 'Games', count: filteredResults.games.length },
    { id: 'users', label: 'Users', count: filteredResults.users.length }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">🔍 Khám phá Game</h1>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
              Tìm kiếm hàng nghìn game, review chi tiết và kết nối với cộng đồng game thủ
            </p>
          </div>

          {/* Enhanced Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative mb-8">
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm game, review, người dùng..."
                  className="w-full pl-16 pr-20 py-5 text-lg border-0 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 bg-white placeholder-gray-600 text-gray-900"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {['Cyberpunk 2077', 'The Witcher 3', 'Elden Ring', 'GTA V', 'Minecraft'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    performSearch(suggestion);
                    window.history.pushState(null, '', `/search?q=${encodeURIComponent(suggestion)}`);
                  }}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-sm hover:bg-indigo-100 transition-all duration-300 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 opacity-20">
          <FaGamepad className="text-4xl text-white animate-bounce" />
        </div>
        <div className="absolute bottom-8 left-8 opacity-20">
          <FaFire className="text-3xl text-white animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <FaSearch className="text-6xl text-indigo-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Đang tìm kiếm...</h3>
              <p className="text-gray-600">Chúng tôi đang tìm những kết quả phù hợp nhất cho bạn</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      ) : searchTerm ? (
        <div>
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl">
                  <FaSearch className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kết quả tìm kiếm</h2>
                  <p className="text-gray-600">
                    Tìm thấy <span className="font-bold text-indigo-600">{tabs.find(tab => tab.id === 'all')?.count || 0}</span> kết quả cho "<span className="font-medium text-gray-900">{searchTerm}</span>"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    showFilters 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFilter className="text-sm" />
                  <span>Bộ lọc</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaMicrophone className="text-gray-400" />
                  <span>Tìm kiếm bằng giọng nói</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                  <FaFilter className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bộ lọc nâng cao</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Genre Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎮 Thể loại
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                  >
                    <option value="all">Tất cả thể loại</option>
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="rpg">RPG</option>
                    <option value="strategy">Strategy</option>
                    <option value="simulation">Simulation</option>
                    <option value="sports">Sports</option>
                    <option value="racing">Racing</option>
                    <option value="puzzle">Puzzle</option>
                  </select>
                </div>

                {/* Platform Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💻 Nền tảng
                  </label>
                  <select
                    value={filters.platform}
                    onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                  >
                    <option value="all">Tất cả nền tảng</option>
                    <option value="pc">PC</option>
                    <option value="playstation">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="nintendo">Nintendo Switch</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⭐ Đánh giá tối thiểu
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                  >
                    <option value="all">Tất cả đánh giá</option>
                    <option value="9">9+ ⭐⭐⭐⭐⭐</option>
                    <option value="8">8+ ⭐⭐⭐⭐</option>
                    <option value="7">7+ ⭐⭐⭐</option>
                    <option value="6">6+ ⭐⭐</option>
                    <option value="5">5+ ⭐</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔄 Sắp xếp theo
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                  >
                    <option value="relevance">📊 Liên quan nhất</option>
                    <option value="rating">⭐ Đánh giá cao nhất</option>
                    <option value="newest">🕒 Mới nhất</option>
                    <option value="popular">🔥 Phổ biến nhất</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Đang hiển thị {filteredResults.reviews.length} kết quả
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFilters({ genre: 'all', platform: 'all', rating: 'all' });
                      setSortBy('relevance');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
                  >
                    🔄 Đặt lại
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    ✅ Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tabs */}
          <div className="bg-white rounded-2xl shadow-2xl p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex-1 min-w-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">
                    {tab.id === 'reviews' && '📝'}
                    {tab.id === 'games' && '🎮'}
                    {tab.id === 'users' && '👤'}
                    {tab.id === 'all' && '🔍'}
                  </span>
                  <span className="truncate">{tab.label}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-white bg-opacity-25 text-indigo-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Content */}
          <div className="space-y-8">
            {/* Reviews Tab */}
            {(activeTab === 'all' || activeTab === 'reviews') && (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl">
                    <FaGamepad className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Bài review ({filteredResults.reviews.length})</h2>
                </div>
                {filteredResults.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {filteredResults.reviews.map(review => (
                      <div key={review._id} className="transform hover:scale-[1.02] transition-all duration-300">
                        <ReviewListItem review={review} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaGamepad className="text-4xl text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy bài review nào</h3>
                    <p className="text-gray-500 mb-6">Hãy thử từ khóa khác hoặc điều chỉnh bộ lọc</p>
                    <button
                      onClick={() => {
                        setFilters({ genre: 'all', platform: 'all', rating: 'all' });
                        setSortBy('relevance');
                      }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🔄 Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Games Tab */}
            {(activeTab === 'all' || activeTab === 'games') && (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                    <FaGamepad className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Games ({filteredResults.games.length})</h2>
                </div>
                {filteredResults.games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.games.map(game => (
                      <div key={game.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2 border border-gray-100">
                        <div className="relative mb-4">
                          <img
                            src={game.image || '/placeholder-game.jpg'}
                            alt={game.name}
                            className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            ⭐ {game.rating ? game.rating.toFixed(1) : 'N/A'}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                            {game.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {game.genres?.slice(0, 3).map(genre => (
                              <span key={genre} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                {genre}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {game.platforms?.slice(0, 3).map(platform => (
                              <span key={platform} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                {platform}
                              </span>
                            ))}
                          </div>
                          {game.released && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {new Date(game.released).getFullYear()}
                            </p>
                          )}
                          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaGamepad className="text-4xl text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy game nào</h3>
                    <p className="text-gray-500 mb-6">Hãy thử từ khóa khác hoặc kiểm tra kết nối mạng</p>
                    <button
                      onClick={() => performSearch(searchTerm)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🔄 Thử lại
                    </button>
                  </div>
                )}
              </div>
            )}



            {/* Users Tab */}
            {(activeTab === 'all' || activeTab === 'users') && (
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-2xl">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Người dùng ({filteredResults.users.length})</h2>
                </div>
                {filteredResults.users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.users.map(user => (
                      <div key={user.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2 border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="flex-1">
                            <Link to={`/profile/${user.id}`}>
                              <h3 className="font-bold text-xl text-gray-900 hover:text-indigo-600 transition-colors mb-1">
                                {user.username}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaGamepad className="text-xs" />
                              {user.reviewsCount} reviews
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{user.bio}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaUsers className="text-xs" />
                            <span>{user.followers.toLocaleString()} followers</span>
                          </div>
                          <Link
                            to={`/profile/${user.id}`}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Xem profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-green-100 to-teal-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaUser className="text-4xl text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Không tìm thấy người dùng nào</h3>
                    <p className="text-gray-500 mb-6">Hãy thử từ khóa khác hoặc tìm theo tên người dùng</p>
                    <button
                      onClick={() => {
                        setFilters({ genre: 'all', platform: 'all', rating: 'all' });
                        setSortBy('relevance');
                      }}
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🔄 Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-6xl text-indigo-500" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-bounce">
                ?
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">🔍 Bắt đầu khám phá</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Khám phá hàng nghìn game, đọc review chi tiết và kết nối với cộng đồng game thủ
              </p>
            </div>

            {/* Popular Searches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Tìm kiếm phổ biến:</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'Cyberpunk 2077', 'The Witcher 3', 'Elden Ring', 'GTA V',
                  'Minecraft', 'Hades', 'Baldur\'s Gate 3', 'Spider-Man'
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      performSearch(suggestion);
                      window.history.pushState(null, '', `/search?q=${encodeURIComponent(suggestion)}`);
                    }}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <FaGamepad className="text-4xl text-blue-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Tìm Game</h4>
                <p className="text-sm text-gray-600">Khám phá hàng nghìn tựa game với đánh giá chi tiết</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <FaUser className="text-4xl text-purple-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Kết nối</h4>
                <p className="text-sm text-gray-600">Kết nối với những người có sở thích game giống bạn</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl">
                <FaStar className="text-4xl text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Đánh giá</h4>
                <p className="text-sm text-gray-600">Đọc review từ cộng đồng và đưa ra quyết định sáng suốt</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
