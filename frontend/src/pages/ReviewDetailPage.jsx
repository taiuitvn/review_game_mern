import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReviewById , commentOnReview } from '../api/reviews'; 
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FaBookmark, FaRegBookmark, FaHeart, FaShare, FaArrowLeft, FaThumbsUp, FaClock, FaEye, FaComments, FaGamepad, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Comment from '../components/reviews/Comment';
import SuggestedReviews from '../components/reviews/SuggestedReviews'; 

const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, saveReview, unsaveReview, isReviewSaved } = useAuth();
  const { addNotification } = useNotification();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const { data } = await getReviewById(id);
        setReview(data);
        // Set initial like state
        setIsLiked(data.isLiked || false);
        setLikesCount(data.likes || 0);
      } catch (error) {
        console.error("Failed to fetch review:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
        const { data: newComment } = await commentOnReview(id, { text: comment });
        
        setReview(prevReview => ({
            ...prevReview,
            comments: [...prevReview.comments, newComment]
        }));

        // Show notification
        addNotification({
          type: 'comment',
          title: 'Bình luận thành công!',
          message: 'Bình luận của bạn đã được đăng.',
          persistent: false
        });

        setComment(''); 
    } catch (error) {
        console.error("Failed to post comment:", error);
        addNotification({
          type: 'error',
          title: 'Lỗi!',
          message: 'Không thể đăng bình luận. Vui lòng thử lại.',
          persistent: false
        });
    }
  };

  const handleCommentLike = (commentId, isLike) => {
    // Update comment likes in state
    setReview(prevReview => ({
      ...prevReview,
      comments: prevReview.comments.map(c =>
        c._id === commentId
          ? { ...c, likes: (c.likes || 0) + (isLike ? 1 : -1) }
          : c
      )
    }));
  };

  const handleCommentDislike = (commentId, isDislike) => {
    // Update comment dislikes in state
    setReview(prevReview => ({
      ...prevReview,
      comments: prevReview.comments.map(c =>
        c._id === commentId
          ? { ...c, dislikes: (c.dislikes || 0) + (isDislike ? 1 : -1) }
          : c
      )
    }));
  };

  const handleCommentReply = (commentId, replyText) => {
    // Add reply to comment
    const newReply = {
      _id: Date.now().toString(),
      text: replyText,
      author: user,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    setReview(prevReview => ({
      ...prevReview,
      comments: prevReview.comments.map(c =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      )
    }));
  };

  const handleSaveToggle = () => {
    if (!user) return;

    if (isReviewSaved(id)) {
      unsaveReview(id);
      addNotification({
        type: 'info',
        title: 'Đã bỏ lưu',
        message: 'Bài viết đã được bỏ khỏi danh sách đã lưu.',
        persistent: false
      });
    } else {
      saveReview(id);
      addNotification({
        type: 'success',
        title: 'Đã lưu bài viết!',
        message: 'Bài viết đã được thêm vào danh sách đã lưu.',
        persistent: false
      });
    }
  };

  const handleLikeToggle = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      // Update local state immediately for better UX
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Here you would typically call an API to persist the like
      // await likeReview(id, newIsLiked);

      addNotification({
        type: newIsLiked ? 'success' : 'info',
        title: newIsLiked ? 'Đã thích bài viết!' : 'Đã bỏ thích',
        message: newIsLiked ? 'Cảm ơn bạn đã ủng hộ tác giả.' : 'Đã bỏ thích bài viết.',
        persistent: false
      });

    } catch {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      addNotification({
        type: 'error',
        title: 'Lỗi!',
        message: 'Không thể thực hiện hành động này. Vui lòng thử lại.',
        persistent: false
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: review?.title,
        text: review?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <FaGamepad className="text-6xl text-blue-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải bài review...</h2>
              <p className="text-gray-600">Chúng tôi đang chuẩn bị nội dung chi tiết cho bạn</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h2>
          <p className="text-gray-600 mb-6">Bài viết này có thể đã bị xóa hoặc không tồn tại.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaArrowLeft />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const contentPreview = review.content.length > 500 ? review.content.substring(0, 500) + '...' : review.content;
  const shouldShowExpand = review.content.length > 500;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {}
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <FaArrowLeft />
        <span>Quay lại trang chủ</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2">

      {}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {}
        <div className="relative">
          <img src={review.gameImage} alt={review.title} className="w-full h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                {review.score}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider">{review.genres?.join(', ')}</p>
                <h1 className="text-3xl font-extrabold leading-tight">{review.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <FaGamepad />
                    {review.gameName}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            {}
            <div className="flex items-center gap-3">
              <Link to={`/profile/${review.author?.id}`} className="flex items-center gap-3 hover:text-indigo-600 transition-colors">
                <img src={review.author?.avatar} alt={review.author?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{review.author?.name}</span>
                    {review.author?.isVerified && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓ Đã xác thực</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {review.views || 0} lượt xem
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                <FaHeart className="text-xs" />
                <span className="font-medium">{likesCount} thích</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                <FaComments className="text-xs" />
                <span className="font-medium">{review.comments?.length || 0} bình luận</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <FaBookmark className="text-xs" />
                <span className="font-medium">{review.saves || 0} đã lưu</span>
              </div>
            </div>


          </div>
        </div>

        {}
        <div className="p-6">
        <div className="prose lg:prose-xl max-w-none">
            <div className="text-gray-700 leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: isExpanded ? review.content : contentPreview
                }}
                className="mb-4"
              />

              {shouldShowExpand && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <span>← Thu gọn</span>
                    </>
                  ) : (
                    <>
                      <span>Đọc thêm</span>
                      <span className="text-xs">({Math.ceil((review.content.length - 500) / 100)} phút đọc)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

  {}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isLiked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : user
                      ? 'hover:bg-red-50 hover:text-red-500 text-gray-600'
                      : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
                title={isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
              >
                <FaHeart className={isLiked ? 'text-red-600' : ''} />
                <span className="hidden sm:inline">{likesCount}</span>
              </button>

              <button
                onClick={handleSaveToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  user && isReviewSaved(id)
                    ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    : user ? 'hover:bg-gray-100 hover:text-indigo-600 text-gray-600' : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
                title={user && isReviewSaved(id) ? 'Bỏ lưu' : 'Lưu bài viết'}
              >
                {user && isReviewSaved(id) ? <FaBookmark /> : <FaRegBookmark />}
                <span className="hidden sm:inline">Lưu</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-all"
                title="Chia sẻ bài viết"
              >
                <FaShare />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>

          {}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              {review.tags && review.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        onClick={() => navigate(`/search?q=${tag}`)}
                      >
                        <span>#</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📊 Thống kê</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Thời gian đọc:</span>
                    <span>{Math.ceil(review.content.length / 200)} phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số từ:</span>
                    <span>{review.content.split(/\s+/).filter(word => word.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cập nhật:</span>
                    <span>{new Date(review.updatedAt || review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-4">
              <img
                src={review.gameImage}
                alt={review.gameName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{review.gameName}</h4>
                <p className="text-sm text-gray-600">Game được review trong bài viết này</p>
                <button
                  onClick={() => navigate(`/search?q=${review.gameName}`)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                >
                  Tìm thêm review về game này →
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {}
      <section className="mt-12 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          💬 Bình luận ({review.comments?.length || 0})
        </h2>

        {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-600"
                  rows="3"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {comment.length}/500 ký tự
                  </span>
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Đăng bình luận
            </button>
                </div>
              </div>
            </div>
        </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 mb-4">Đăng nhập để bình luận về bài viết này</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {review.comments && review.comments.length > 0 ? (
            review.comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                onLike={handleCommentLike}
                onDislike={handleCommentDislike}
                onReply={handleCommentReply}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
          )}
        </div>
      </section>

        </div> {}

        {}
        <div className="lg:col-span-1">
          <SuggestedReviews
            currentReviewId={id}
            gameTags={review.tags}
            authorId={review.author?.id}
          />

          {}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">👤 Tác giả</h3>
            <Link
              to={`/profile/${review.author?.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={review.author?.avatar}
                alt={review.author?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900">{review.author?.name}</div>
                <div className="text-sm text-gray-600">
                  {review.author?.isVerified && '✓ Đã xác thực'}
                </div>
              </div>
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{review.author?.totalReviews || 0}</div>
                  <div className="text-xs text-gray-600">Bài viết</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{review.author?.followers || 0}</div>
                  <div className="text-xs text-gray-600">Người theo dõi</div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2">📖 Tiến độ đọc</h4>
            <div className="text-sm text-gray-600 mb-2">
              {isExpanded ? 'Đã đọc đầy đủ' : `Đã đọc ${Math.round((contentPreview.length / review.content.length) * 100)}%`}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: isExpanded ? '100%' : `${Math.round((contentPreview.length / review.content.length) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
