import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import {
  FaUserPlus,
  FaUserCheck,
  FaEdit,
  FaBookmark,
  FaClipboardList,
  FaUsers,
  FaArrowLeft,
  FaEye,
  FaHeart,
  FaComment,
  FaStar,
  FaTrophy,
  FaAward
} from 'react-icons/fa';
import ReviewListItem from '../components/reviews/ReviewListItem';
import EditProfileModal from '../components/profile/EditProfileModal';
import Pagination from '../components/common/Pagination';
import { getUserById, getUserPosts, getUserStats, getMyProfile, getMyStats } from '../api/users';
import { usePosts } from '../hooks';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: loggedInUser, followUser, unfollowUser, isFollowing, updateProfile } = useAuth();
  const { posts } = usePosts();

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('posted'); // 'posted', 'saved', 'following'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isOwnProfile = !userId || (loggedInUser && (loggedInUser._id || loggedInUser.id) === userId);
  const targetUserId = userId || (loggedInUser && (loggedInUser._id || loggedInUser.id));

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isOwnProfile && loggedInUser) {
          // Get current user's profile and stats from API
          const userIdVal = (loggedInUser._id || loggedInUser.id);
          
          const [profileResponse, postsResponse, statsResponse] = await Promise.allSettled([
            getMyProfile(),
            getUserPosts(userIdVal),
            getMyStats()
          ]);

          if (profileResponse.status === 'fulfilled') {
            const userData = profileResponse.value;
            const userPostsData = postsResponse.status === 'fulfilled' ? postsResponse.value : [];
            const statsData = statsResponse.status === 'fulfilled' ? statsResponse.value : {};
            
            console.log('Profile data for own profile:', {
              following: userData.following,
              followingLength: userData.following?.length,
              followingType: typeof userData.following?.[0]
            });
            
            setProfile({
              id: userData._id,
              username: userData.username,
              email: userData.email,
              avatar: userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData._id}`,
              bannerImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
              bio: userData.bio || 'Game thủ yêu thích các tựa game RPG và khám phá thế giới mở.',
              joinDate: userData.createdAt
                ? `Joined ${new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}`
                : 'Joined recently',
              followers: userData.followers?.length || 0,
              following: userData.following?.length || 0,
              postedReviews: userPostsData,
              savedReviews: userData.savedPosts || [],
              followingUsers: (userData.following || []).map(user => ({
                id: user._id,
                username: user.username,
                avatar: user.avatarUrl || `https://i.pravatar.cc/150?u=${user._id}`,
                bio: user.bio || 'Game thủ yêu thích game.',
                reviewsCount: 0, // Will be calculated separately if needed
                followers: [] // Will be populated separately if needed
              }))
            });
            setUserPosts(userPostsData);
            setUserStats({
              totalViews: statsData.totalViews || 0,
              totalLikes: statsData.totalLikes || 0,
              totalComments: statsData.totalComments || 0,
              avgRating: statsData.avgRating || 0
            });
          }
        } else {
          // Fetch other user's data from API
          const tid = String(targetUserId);
          const [userResponse, userPostsResponse, statsResponse] = await Promise.allSettled([
            getUserById(tid),
            getUserPosts(tid),
            getUserStats(tid)
          ]);

          if (userResponse.status === 'fulfilled') {
            const userData = userResponse.value;
            const userPostsData = userPostsResponse.status === 'fulfilled' 
              ? userPostsResponse.value 
              : [];
            const statsData = statsResponse.status === 'fulfilled' ? statsResponse.value : {};

            setProfile({
              id: userData._id,
              username: userData.username,
              email: userData.email,
              avatar: userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData._id}`,
              bannerImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
              bio: userData.bio || 'Chuyên gia đánh giá game.',
              joinDate: userData.createdAt
                ? `Joined ${new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}`
                : 'Joined recently',
              followers: userData.followers?.length || 0,
              following: userData.following?.length || 0,
              postedReviews: userPostsData,
              savedReviews: userData.savedPosts || [],
              followingUsers: (userData.following || []).map(user => ({
                id: user._id,
                username: user.username,
                avatar: user.avatarUrl || `https://i.pravatar.cc/150?u=${user._id}`,
                bio: user.bio || 'Game thủ yêu thích game.',
                reviewsCount: 0, // Will be calculated separately if needed
                followers: [] // Will be populated separately if needed
              }))
            });
            setUserPosts(userPostsData);
            setUserStats({
              totalViews: statsData.totalViews || 0,
              totalLikes: statsData.totalLikes || 0,
              totalComments: statsData.totalComments || 0,
              avgRating: statsData.avgRating || 0
            });
          } else {
            throw new Error('User not found');
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId, loggedInUser, posts, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!loggedInUser || !targetUserId) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing(targetUserId)) {
        await unfollowUser(targetUserId);
        // Giảm số follower khi bỏ theo dõi (chỉ khi xem profile của người khác)
        if (!isOwnProfile) {
          setProfile(prev => prev ? { ...prev, followers: Math.max(0, (prev.followers || 0) - 1) } : prev);
        }
      } else {
        await followUser(targetUserId);
        // Tăng số follower khi theo dõi (chỉ khi xem profile của người khác)
        if (!isOwnProfile) {
          setProfile(prev => prev ? { ...prev, followers: (prev.followers || 0) + 1 } : prev);
        }
      }
    } catch (e) {
      console.error('Follow/unfollow failed:', e);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Pagination logic
  const getPaginatedItems = (items) => {
    if (!items || items.length === 0) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items) => {
    if (!items || items.length === 0) return 0;
    return Math.ceil(items.length / ITEMS_PER_PAGE);
  };

  // Reset to first page when view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  if (loading) return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  if (!profile) return null;

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 py-4 md:py-5 px-6 md:px-8 font-bold transition-all duration-300 relative text-sm md:text-base border-r border-gray-200 last:border-r-0 ${
        active
          ? 'text-indigo-600 bg-white rounded-t-2xl shadow-sm transform scale-105'
          : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50 hover:transform hover:scale-102'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full"></div>
      )}
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Banner Image */}
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${profile.bannerImage})` }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex items-end">
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg relative z-20"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                {profile.username}
              </h1>
              <p className="text-white drop-shadow-2xl mb-4 text-sm md:text-base font-medium bg-black bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
                {profile.joinDate}
              </p>

              {/* Action Button */}
              <div className="flex justify-center sm:justify-start">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 bg-black bg-opacity-30 hover:bg-opacity-40 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full backdrop-blur-sm transition-all duration-300 text-sm md:text-base border border-white border-opacity-30 drop-shadow-lg"
                  >
                    <FaEdit /> Chỉnh sửa hồ sơ
                  </button>
                ) : loggedInUser ? (
                  <button
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-2 font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full transition-all duration-300 backdrop-blur-sm text-sm md:text-base ${
                      isFollowing(targetUserId)
                        ? 'bg-black bg-opacity-30 hover:bg-opacity-40 text-white border border-white border-opacity-30 drop-shadow-lg'
                        : 'bg-white text-indigo-600 hover:bg-opacity-90 drop-shadow-lg'
                    }`}
                  >
                    {isFollowing(targetUserId) ? (
                      <>
                        <FaUserCheck /> <span className="hidden sm:inline">{isFollowLoading ? 'Đang xử lý...' : 'Đang theo dõi'}</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> <span className="hidden sm:inline">{isFollowLoading ? 'Đang xử lý...' : 'Theo dõi'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 bg-white text-indigo-600 font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full hover:bg-opacity-90 transition-all duration-300 backdrop-blur-sm text-sm md:text-base drop-shadow-lg"
                  >
                    <FaUserPlus /> <span className="hidden sm:inline">Đăng nhập để theo dõi</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4">
        {/* Stats Bar */}
        <div className="-mb-5 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaClipboardList className="text-white text-lg md:text-xl" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile.postedReviews.length}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Reviews</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-white text-lg md:text-xl" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile.followers.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Followers</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaUserPlus className="text-white text-lg md:text-xl" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile.following}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Following</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaBookmark className="text-white text-lg md:text-xl" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile.savedReviews?.length || 0}
                </p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Saved</p>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <FaEye className="text-indigo-600 text-base md:text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-lg md:text-2xl font-bold text-indigo-700">
                    {userStats.totalViews.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs md:text-sm font-medium text-indigo-600">Total Views</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <FaHeart className="text-red-600 text-base md:text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-lg md:text-2xl font-bold text-red-700">
                    {userStats.totalLikes.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs md:text-sm font-medium text-red-600">Total Likes</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <FaComment className="text-emerald-600 text-base md:text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-lg md:text-2xl font-bold text-emerald-700">
                    {userStats.totalComments.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs md:text-sm font-medium text-emerald-600">Comments</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <FaStar className="text-amber-600 text-base md:text-lg group-hover:scale-110 transition-transform" />
                  <div className="text-lg md:text-2xl font-bold text-amber-700">
                    {userStats.avgRating > 0 ? userStats.avgRating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <div className="text-xs md:text-sm font-medium text-amber-600">Avg Rating</div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 mb-4">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaAward className="text-indigo-600" />
                Giới thiệu
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <nav className="flex bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <TabButton active={view === 'posted'} onClick={() => setView('posted')}>
              <FaClipboardList /> <span className="hidden sm:inline font-medium">Bài đã đăng</span>{' '}
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs ml-2 font-semibold">
                ({profile.postedReviews?.length || 0})
              </span>
            </TabButton>
            {isOwnProfile && (
              <TabButton active={view === 'saved'} onClick={() => setView('saved')}>
                <FaBookmark /> <span className="hidden sm:inline font-medium">Bài đã lưu</span>{' '}
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs ml-2 font-semibold">
                  ({profile.savedReviews?.length || 0})
                </span>
              </TabButton>
            )}
            <TabButton active={view === 'following'} onClick={() => setView('following')}>
              <FaUsers /> <span className="hidden sm:inline font-medium">Đang theo dõi</span>{' '}
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs ml-2 font-semibold">
                ({profile.followingUsers?.length || 0})
              </span>
            </TabButton>
          </nav>

          <div className="p-4 md:p-8">
            {view === 'posted' && (
              <div className="space-y-6">
                {profile.postedReviews.length > 0 ? (
                  <>
                    {getPaginatedItems(profile.postedReviews).map((review) => (
                      <ReviewListItem key={review._id} review={review} />
                    ))}
                    
                    {/* Pagination */}
                    {getTotalPages(profile.postedReviews) > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={getTotalPages(profile.postedReviews)}
                        onPageChange={setCurrentPage}
                        className="pt-8"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có bài viết nào</h3>
                    <p className="text-gray-500 mb-6">Hãy tạo bài review đầu tiên của bạn!</p>
                    {isOwnProfile && (
                      <Link
                        to="/create-review"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                      >
                        <FaEdit /> Viết Review đầu tiên
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'saved' && isOwnProfile && (
              <div className="space-y-6">
                {profile.savedReviews?.length > 0 ? (
                  <>
                    {getPaginatedItems(profile.savedReviews).map((review) => (
                      <ReviewListItem key={review._id} review={review} />
                    ))}
                    
                    {/* Pagination */}
                    {getTotalPages(profile.savedReviews) > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={getTotalPages(profile.savedReviews)}
                        onPageChange={setCurrentPage}
                        className="pt-8"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FaBookmark className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có bài viết nào được lưu</h3>
                    <p className="text-gray-500 mb-6">Khám phá và lưu những review hay!</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
                    >
                      <FaBookmark /> Khám phá Reviews
                    </Link>
                  </div>
                )}
              </div>
            )}

            {view === 'following' && (
              <div>
                {profile.followingUsers && profile.followingUsers.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getPaginatedItems(profile.followingUsers).map((user) => {
                        // Safety check for user data
                        if (!user || !user.id) {
                          console.warn('Invalid user data:', user);
                          return null;
                        }
                        
                        return (
                          <div
                            key={user.id}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <img
                                src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                                alt={user.username || 'Anonymous'}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = `https://i.pravatar.cc/150?u=${user.id}`;
                                }}
                              />
                              <div className="flex-1">
                                <Link
                                  to={`/profile/${user.id}`}
                                  className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-lg"
                                >
                                  {user.username || 'Anonymous User'}
                                </Link>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <FaClipboardList className="text-xs" />
                                  {user.reviewsCount || 0} reviews
                                </p>
                              </div>
                              {loggedInUser && loggedInUser.id !== user.id && (
                                <button
                                  onClick={() => {
                                    if (isFollowing(user.id)) {
                                      unfollowUser(user.id);
                                    } else {
                                      followUser(user.id);
                                    }
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    isFollowing(user.id)
                                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                                  }`}
                                >
                                  {isFollowing(user.id) ? 'Đang theo dõi' : 'Theo dõi'}
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {user.bio || 'Người dùng chưa có giới thiệu.'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1 bg-white bg-opacity-80 px-2 py-1 rounded-full">
                                <FaUsers className="text-xs text-gray-600" />
                                <span className="text-gray-700 font-medium">
                                  {(user.followers?.length || 0).toLocaleString()} followers
                                </span>
                              </span>
                              <span className="flex items-center gap-1 bg-amber-100 bg-opacity-90 px-2 py-1 rounded-full">
                                <FaTrophy className="text-xs text-amber-600" />
                                <span className="text-amber-700 font-medium">Reviewer</span>
                              </span>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                    
                    {/* Pagination */}
                    {getTotalPages(profile.followingUsers) > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={getTotalPages(profile.followingUsers)}
                        onPageChange={setCurrentPage}
                        className="pt-8"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaUsers className="text-4xl text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">Chưa theo dõi ai cả</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Khám phá cộng đồng game thủ và kết nối với những người có sở thích tương tự!
                    </p>
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <FaUsers /> Tìm người dùng để theo dõi
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initial={{
          username: profile?.username || '',
          bio: profile?.bio || '',
          avatarUrl: profile?.avatar || ''
        }}
        onSave={async (data) => {
          try {
            const result = await updateProfile({ username: data.username, bio: data.bio, avatarUrl: data.avatarUrl });
            if (result?.success && result.user) {
              setProfile(prev => prev ? {
                ...prev,
                username: result.user.username,
                bio: result.user.bio,
                avatar: result.user.avatarUrl
              } : prev);
            }
          } catch (e) {
            console.error('Failed to update profile:', e);
          }
        }}
      />
    </div>
  );
};

export default ProfilePage;
