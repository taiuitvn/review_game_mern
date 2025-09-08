import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllPosts } from '../../api/reviews';
import AnimatedCard from '../../components/common/AnimatedCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { FaGamepad, FaFilter, FaSortAmountDown, FaSearch, FaFire } from 'react-icons/fa';

const GenrePage = () => {
  const { genre } = useParams();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  React.useEffect(() => {
    setLoading(true);
    console.log('Fetching all posts for frontend filtering');
    getAllPosts()
      .then((resp) => {
        console.log('All posts response:', resp);
        
        // Handle different response formats
        let data = [];
        if (Array.isArray(resp)) {
          data = resp;
        } else if (Array.isArray(resp?.data)) {
          data = resp.data;
        } else if (resp?.data?.posts && Array.isArray(resp.data.posts)) {
          data = resp.data.posts;
        } else if (resp?.posts && Array.isArray(resp.posts)) {
          data = resp.posts;
        }
        
        console.log('All posts data:', data);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching all posts:', error);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    let result = safeItems;
    
    // Filter by genre first
    if (genre) {
      const targetGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
      result = result.filter(item => 
        item.genres && Array.isArray(item.genres) && 
        item.genres.some(g => g.toLowerCase() === targetGenre.toLowerCase())
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating':
        result.sort((a, b) => (b.avgRating !== undefined ? b.avgRating : (b.rating || 0)) - (a.avgRating !== undefined ? a.avgRating : (a.rating || 0)));
        break;
      case 'views':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [items, searchTerm, sortBy, genre]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, genre]);

  // Reset to first page if current page exceeds total pages
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <FaGamepad className="text-6xl text-green-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải thể loại game...</h2>
              <p className="text-gray-600">Chúng tôi đang tìm kiếm những game hay trong thể loại này</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <FaGamepad className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Thể loại: <span className="text-indigo-600 dark:text-indigo-400 capitalize">{genre}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Khám phá {filtered.length} bài review thuộc thể loại "{genre}"
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <label htmlFor="search-input" className="sr-only">
              Tìm kiếm bài review trong thể loại {genre}
            </label>
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm trong thể loại này..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              aria-describedby="search-description"
            />
            <div id="search-description" className="sr-only">
              Nhập từ khóa để tìm kiếm bài review theo tiêu đề hoặc mô tả
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">
              Sắp xếp bài review theo
            </label>
             <FaSortAmountDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" aria-hidden="true" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[200px] transition-all duration-200"
              aria-label="Chọn cách sắp xếp bài review"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="views">Lượt xem</option>
              <option value="likes">Yêu thích</option>
            </select>
                    </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <FaSearch className="text-3xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có review nào'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm 
                  ? `Không có bài review nào khớp với "${searchTerm}" trong thể loại ${genre}`
                  : `Chưa có review nào thuộc thể loại "${genre}". Hãy quay lại sau hoặc khám phá các thể loại khác.`
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
              <Link 
                to="/trending" 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium inline-flex items-center gap-2"
              >
                <FaFire className="w-4 h-4" />
                Xem Trending
              </Link>
            </div>
          </div>
        ) : (
          <>
          {/* Results Content */}
          <div className="space-y-8">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Hiển thị <span className="font-semibold text-indigo-600 dark:text-indigo-400">{paginatedReviews.length}</span> trong tổng số <span className="font-semibold">{filtered.length}</span> kết quả
                {searchTerm && (
                  <span> cho "<span className="font-medium">{searchTerm}</span>"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      ✕ Xóa
                    </button>
                  </span>
                )}
              </p>
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedReviews.map(review => (
                <AnimatedCard 
                  key={review._id} 
                  review={review}
                  className="transform transition-all duration-300"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-8"
              />
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenrePage;


