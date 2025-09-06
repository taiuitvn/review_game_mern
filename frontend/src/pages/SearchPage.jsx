import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '../components/common/Pagination';
import ReviewListItem from '../components/reviews/ReviewListItem';
import { FaSearch, FaGamepad, FaFilter, FaTimes, FaFire, FaSortAmountDown, FaCalendarAlt, FaStar, FaUser, FaTags } from 'react-icons/fa';
import { searchPostsByTitle, searchPostsAdvanced } from '../api/reviews';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchMode, setSearchMode] = useState('advanced'); // 'simple' or 'advanced'
  const [filters, setFilters] = useState({
    rating: 'all',
    tags: 'all',
    author: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  
  const ITEMS_PER_PAGE = 12;

  // Lấy search term từ URL (nếu có)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
    if (query.trim()) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (query, useAdvanced = true) => {
    if (!query.trim()) {
      setReviews([]);
      setTotalResults(0);
      setTotalPages(1);
      setSearchInfo(null);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', query, 'Advanced:', useAdvanced);
      
      let response;
      if (useAdvanced && searchMode === 'advanced') {
        // Use enhanced search with filters
        response = await searchPostsAdvanced(query, {
          sortBy,
          ...filters,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        });
      } else {
        // Use simple title search (fallback)
        response = await searchPostsByTitle(query);
      }
      
      console.log('Search response:', response);
      
      // Handle different response formats
      let fetchedData = [];
      let pagination = null;
      let searchMetadata = null;
      
      if (response?.success && response?.data) {
        // Enhanced search response
        fetchedData = response.data.posts || [];
        pagination = response.data.pagination;
        searchMetadata = response.data.searchInfo;
      } else if (Array.isArray(response)) {
        // Simple search response
        fetchedData = response;
      } else if (Array.isArray(response?.data)) {
        fetchedData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        fetchedData = response.data.data;
      } else if (response?.posts && Array.isArray(response.posts)) {
        fetchedData = response.posts;
      }
      
      console.log('Processed search results:', {
        count: fetchedData.length,
        pagination,
        searchMetadata
      });
      
      setReviews(fetchedData);
      setSearchInfo(searchMetadata);
      
      if (pagination) {
        setTotalPages(pagination.totalPages);
        setTotalResults(pagination.totalPosts);
      } else {
        // Fallback for simple search
        const totalCount = fetchedData.length;
        setTotalResults(totalCount);
        setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      setReviews([]);
      setTotalResults(0);
      setTotalPages(1);
      setSearchInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentPage(1); // Reset to first page
      performSearch(searchTerm, searchMode === 'advanced');
      // Update URL
      const params = new URLSearchParams({ q: searchTerm });
      if (searchMode === 'advanced') {
        if (filters.rating !== 'all') params.set('rating', filters.rating);
        if (filters.tags !== 'all') params.set('tags', filters.tags);
        if (filters.author !== 'all') params.set('author', filters.author);
        if (sortBy !== 'relevance') params.set('sortBy', sortBy);
      }
      window.history.pushState(null, '', `/search?${params.toString()}`);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Re-search when filters, sort, or page changes
  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch(searchTerm, searchMode === 'advanced');
    }
  }, [filters, sortBy, currentPage, searchMode]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      rating: 'all',
      tags: 'all',
      author: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // For display purposes, we'll use the reviews directly from the search
  // since filtering is now handled on the backend
  const displayReviews = reviews;

  // Pagination is now handled by the backend, so we use all returned reviews  
  const paginatedReviews = displayReviews;

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
                  placeholder="Gõ từ khóa để lọc tiêu đề (tùy chọn)"
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
            </form>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {['Cyberpunk 2077', 'The Witcher 3', 'Elden Ring', 'GTA V', 'Minecraft'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setCurrentPage(1);
                    performSearch(suggestion, searchMode === 'advanced');
                    window.history.pushState(null, '', `/search?q=${encodeURIComponent(suggestion)}`);
                  }}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-sm hover:bg-indigo-100 transition-all duration-300 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Search Mode Toggle */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
                <button
                  onClick={() => setSearchMode('advanced')}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${searchMode === 'advanced' 
                    ? 'bg-white text-indigo-600 shadow-lg font-semibold' 
                    : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FaFilter className="inline mr-2" />
                  Tìm kiếm nâng cao
                </button>
                <button
                  onClick={() => setSearchMode('simple')}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${searchMode === 'simple' 
                    ? 'bg-white text-indigo-600 shadow-lg font-semibold' 
                    : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FaSearch className="inline mr-2" />
                  Tìm kiếm đơn giản
                </button>
              </div>
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
        {/* Search Results Header */}
        {searchTerm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl">
                  <FaSearch className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Kết quả cho: "{searchTerm}"
                  </h2>
                  <p className="text-gray-600">
                    {totalResults} kết quả {searchMode === 'advanced' ? '(đã áp dụng bộ lọc)' : ''}
                  </p>
                  {searchInfo && (
                    <div className="text-sm text-gray-500 mt-1">
                      Trang {currentPage} / {totalPages}
                    </div>
                  )}
                </div>
              </div>
              
              {searchMode === 'advanced' && (
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
                  
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300"
                  >
                    <FaTimes className="text-sm" />
                    <span>Đặt lại</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {searchMode === 'advanced' && showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                <FaFilter className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Bộ lọc nâng cao</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaStar className="text-yellow-500" />
                  Đánh giá
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                  <option value="4+">⭐⭐⭐⭐+ (4+ sao)</option>
                  <option value="3+">⭐⭐⭐+ (3+ sao)</option>
                </select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaTags className="text-blue-500" />
                  Tags
                </label>
                <input
                  type="text"
                  value={filters.tags === 'all' ? '' : filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value || 'all')}
                  placeholder="Nhập tags (phân cách bằng dấu phẩy)"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900"
                />
              </div>

              {/* Author Filter */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaUser className="text-green-500" />
                  Tác giả
                </label>
                <input
                  type="text"
                  value={filters.author === 'all' ? '' : filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value || 'all')}
                  placeholder="Tên tác giả"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaCalendarAlt className="text-purple-500" />
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900"
                />
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaSortAmountDown className="text-orange-500" />
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300 text-gray-900 font-medium"
                >
                  <option value="relevance">📊 Liên quan nhất</option>
                  <option value="newest">🕒 Mới nhất</option>
                  <option value="oldest">🕕 Cũ nhất</option>
                  <option value="rating">⭐ Đánh giá cao</option>
                  <option value="views">👁 Lượt xem</option>
                  <option value="likes">❤️ Lượt thích</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            {searchInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Bộ lọc đang áp dụng:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(searchInfo.appliedFilters).map(([key, value]) => {
                    if (value && value !== 'all') {
                      return (
                        <span key={key} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                          {key}: {value}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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
      ) : (
        <div>
          {/* Results Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl">
                <FaGamepad className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bài review {totalResults > 0 ? `(${totalResults})` : ''}
              </h2>
            </div>
            
            {paginatedReviews.length > 0 ? (
              <>
                <div className="space-y-6">
                  {paginatedReviews.map(review => (
                    <ReviewListItem key={review._id} review={review} />
                  ))}
                </div>
                
                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="flex justify-center"
                    />
                    <div className="text-center mt-4 text-sm text-gray-600">
                      Hiển thị trang {currentPage} / {totalPages} ({totalResults} kết quả)
                    </div>
                  </div>
                )}
              </>
            ) : searchTerm ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaGamepad className="text-4xl text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  Không tìm thấy bài review nào
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Không có kết quả phù hợp với từ khóa "{searchTerm}". Hãy thử:
                </p>
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600">• Kiểm tra chính tả từ khóa</p>
                  <p className="text-sm text-gray-600">• Sử dụng từ khóa khác</p>
                  <p className="text-sm text-gray-600">• Điều chỉnh bộ lọc (nếu đang sử dụng)</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🔄 Đặt lại bộ lọc
                  </button>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-all duration-300"
                  >
                    📝 Tìm kiếm mới
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">
                  Hãy nhập từ khóa để tìm kiếm
                </h3>
                <p className="text-gray-500 mb-6">
                  Sử dụng thanh tìm kiếm ở trên để tìm kiếm game, review hoặc nội dung bạn quan tâm
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
