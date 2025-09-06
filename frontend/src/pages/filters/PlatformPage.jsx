import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchReviews } from '../../api/reviews';
import AnimatedCard from '../../components/common/AnimatedCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { FaGamepad, FaSearch, FaSortAmountDown, FaFire } from 'react-icons/fa';

const PlatformPage = () => {
  const { slug } = useParams();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState('newest');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    fetchReviews()
      .then((resp) => {
        const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.posts || []);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const normalized = slug?.toLowerCase();
  const filtered = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    let result = safeItems.filter(r => (r.platforms || r.tags || []).map((p) => String(p).toLowerCase().replace(/\s+/g, '-')).some(p => p === normalized));
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(r => 
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return result;
  }, [items, normalized, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <FaGamepad className="text-6xl text-orange-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải nền tảng game...</h2>
              <p className="text-gray-600">Chúng tôi đang tìm kiếm những game hay trên nền tảng này</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
              <FaGamepad className="text-2xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Nền tảng: <span className="text-emerald-600 dark:text-emerald-400 uppercase">{slug}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Hiển thị các bài review phát hành trên "{slug}" • {filtered.length} kết quả
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <label htmlFor="platform-search-input" className="sr-only">
              Tìm kiếm bài review trong nền tảng {slug}
            </label>
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            <input
              id="platform-search-input"
              type="text"
              placeholder="Tìm kiếm trong nền tảng này..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              aria-describedby="platform-search-description"
            />
            <div id="platform-search-description" className="sr-only">
              Nhập từ khóa để tìm kiếm bài review theo tiêu đề hoặc mô tả trong nền tảng này
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="platform-sort-select" className="sr-only">
              Sắp xếp bài review theo
            </label>
            <FaSortAmountDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" aria-hidden="true" />
            <select
              id="platform-sort-select"
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
                  ? `Không có bài review nào khớp với "${searchTerm}" trên nền tảng ${slug}`
                  : `Chưa có review nào cho nền tảng "${slug}". Hãy quay lại sau hoặc khám phá các nền tảng khác.`
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
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
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Hiển thị <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filtered.length}</span> kết quả
                {searchTerm && (
                  <span> cho "<span className="font-medium">{searchTerm}</span>"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                    >
                      ✕ Xóa
                    </button>
                  </span>
                )}
              </p>
            </div>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(review => (
                <AnimatedCard 
                  key={review._id} 
                  review={review}
                  className="transform transition-all duration-300"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformPage;


