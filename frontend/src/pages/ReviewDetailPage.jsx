import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReviewById , commentOnReview, likeReview, deleteComment, incrementPostViews, replyToComment, updateReview, deleteReview } from '../api/reviews'; 
import { useAuth } from '../hooks';
import { useNotification } from '../contexts/NotificationContext';
import { FaBookmark, FaRegBookmark, FaHeart, FaShare, FaArrowLeft, FaThumbsUp, FaClock, FaEye, FaComments, FaGamepad, FaCalendarAlt, FaUser, FaEdit, FaTrashAlt, FaEllipsisV } from 'react-icons/fa';
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        console.log('Fetching review with ID:', id);
        
        // Check if ID is valid format (24 characters, hex)
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
          console.error('Invalid review ID format:', id);
          setReview(null);
          setLoading(false);
          return;
        }

        const response = await getReviewById(id);
        console.log('Review response received:', response);
        // Handle different response formats
        const reviewData = response?.data?.data || response?.data || response;
        console.log('Processed review data:', {
          id: reviewData?._id,
          title: reviewData?.title,
          author: reviewData?.authorId,
          comments: reviewData?.comments,
          likes: reviewData?.likes,
          isLiked: reviewData?.isLiked,
          currentUser: user
        });
        
        // Map authorId to author for frontend compatibility
        if (reviewData?.authorId && !reviewData?.author) {
          reviewData.author = {
            id: reviewData.authorId._id,
            name: reviewData.authorId.username,
            avatar: reviewData.authorId.avatarUrl || 'https://via.placeholder.com/150',
            isVerified: reviewData.authorId.isVerified || false
          };
        }
        
        // Map comment authors properly
        if (reviewData?.comments && Array.isArray(reviewData.comments)) {
          reviewData.comments = reviewData.comments.map(comment => {
            const mappedComment = {
              ...comment,
              _id: comment._id || comment.id, // Ensure _id exists
              authorId: comment.authorId, // Preserve original authorId
              author: comment.authorId ? {
                id: comment.authorId._id,
                name: comment.authorId.username,
                avatar: comment.authorId.avatarUrl || 'https://via.placeholder.com/150',
                isVerified: comment.authorId.isVerified || false
              } : null,
              text: comment.content || comment.text // Handle both content and text fields
            };
            
            // Debug log each comment mapping
            console.log('Mapping comment:', {
              original: comment,
              mapped: mappedComment,
              hasValidId: !!(mappedComment._id)
            });
            
            return mappedComment;
          });
        }
        
        setReview(reviewData);
      } catch (error) {
        console.error("Failed to fetch review:", error);
        if (error.response?.status === 404) {
          console.log('Review not found');
        } else if (error.response?.status === 400) {
          console.log('Invalid review ID');
        }
        setReview(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchReview();
    } else {
      setLoading(false);
      setReview(null);
    }
  }, [id]);

  // Separate useEffect for initializing like state when both review and user data are available
  useEffect(() => {
    if (review && user) {
      console.log('Initializing like state:', {
        reviewId: review._id,
        userId: user._id || user.id,
        reviewLikes: review.likes,
        isLikedFromBackend: review.isLiked,
        userInLikes: review.likes?.includes(user._id || user.id)
      });
      
      const currentUserId = user._id || user.id;
      // Use backend isLiked if available, otherwise check likes array
      const userHasLiked = review.isLiked !== undefined 
        ? review.isLiked 
        : (Array.isArray(review.likes) && review.likes.includes(currentUserId));
      
      console.log('Setting like state:', {
        userHasLiked,
        currentUserId,
        reviewLikes: review.likes,
        backendIsLiked: review.isLiked
      });
      
      setIsLiked(userHasLiked);
      setLikesCount(Array.isArray(review.likes) ? review.likes.length : 0);
    }
  }, [review, user]);

  // Separate useEffect to increment view count once when review is loaded
  useEffect(() => {
    let hasIncrementedView = false; // Prevent multiple calls in strict mode
    
    if (review && review._id && !hasIncrementedView) {
      const incrementView = async () => {
        try {
          console.log('Incrementing view count for review:', review._id);
          await incrementPostViews(review._id);
          hasIncrementedView = true;
          
          // Update local review state to reflect new view count
          setReview(prev => prev ? {
            ...prev,
            views: (prev.views || 0) + 1
          } : prev);
        } catch (error) {
          console.error('Failed to increment view count:', error);
          // Non-critical error, don't show notification to user
        }
      };
      
      incrementView();
    }
  }, [review?._id]); // Only depend on review._id to prevent multiple calls

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreMenu && !event.target.closest('.more-menu-container')) {
        setShowMoreMenu(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
        console.log('Submitting comment:', { postId: id, content: comment });
        const response = await commentOnReview(id, comment);
        console.log('Comment response:', response);
        
        // Handle the response data properly
        const newCommentData = response?.data || response;
        
        // Ensure we have required fields
        if (!newCommentData || !newCommentData._id) {
          throw new Error('Invalid response from server');
        }
        
        // Map the comment data to expected format
        const mappedComment = {
          _id: newCommentData._id,
          ...newCommentData,
          authorId: newCommentData.authorId || (user._id || user.id), // Preserve authorId
          author: newCommentData.authorId ? {
            id: newCommentData.authorId._id,
            name: newCommentData.authorId.username,
            avatar: newCommentData.authorId.avatarUrl || 'https://via.placeholder.com/150',
            isVerified: newCommentData.authorId.isVerified || false
          } : {
            id: user._id || user.id,
            name: user.username || user.name,
            avatar: user.avatarUrl || user.avatar || 'https://via.placeholder.com/150',
            isVerified: user.isVerified || false
          },
          text: newCommentData.content || newCommentData.text || comment,
          likes: newCommentData.likes || [],
          dislikes: newCommentData.dislikes || [],
          createdAt: newCommentData.createdAt || new Date().toISOString()
        };
        
        console.log('Mapped comment:', mappedComment);
        
        setReview(prevReview => {
          const updatedReview = {
            ...prevReview,
            comments: [mappedComment, ...(prevReview.comments || [])]
          };
          console.log('Updated review with new comment:', updatedReview);
          return updatedReview;
        });

        // Show notification
        addNotification({
          type: 'success',
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

  const handleCommentLike = async (commentId, isLike) => {
    // This function is called after the Comment component handles the API call
    // We can optionally refetch comment data here for consistency
    console.log('Parent handleCommentLike called:', { commentId, isLike });
  };

  const handleCommentDislike = async (commentId, isDislike) => {
    // This function is called after the Comment component handles the API call
    // We can optionally refetch comment data here for consistency
    console.log('Parent handleCommentDislike called:', { commentId, isDislike });
  };

  const handleCommentUpdate = (commentId, updatedComment) => {
    setReview(prevReview => ({
      ...prevReview,
      comments: prevReview.comments.map(c =>
        c._id === commentId
          ? {
              ...c,
              ...updatedComment,
              author: updatedComment.authorId ? {
                id: updatedComment.authorId._id,
                name: updatedComment.authorId.username,
                avatar: updatedComment.authorId.avatarUrl || 'https://via.placeholder.com/150',
                isVerified: updatedComment.authorId.isVerified || false
              } : c.author,
              text: updatedComment.content || updatedComment.text,
              isEdited: true
            }
          : c
      )
    }));
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    
    try {
      await deleteComment(commentId);
      setReview(prevReview => ({
        ...prevReview,
        comments: prevReview.comments.filter(c => c._id !== commentId)
      }));
      
      addNotification({
        type: 'success',
        title: 'Đã xóa bình luận!',
        message: 'Bình luận đã được xóa thành công.',
        persistent: false
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      addNotification({
        type: 'error',
        title: 'Lỗi!',
        message: 'Không thể xóa bình luận. Vui lòng thử lại.',
        persistent: false
      });
    }
  };

  const handleCommentReply = async (commentId, replyText) => {
    try {
      console.log('Submitting reply:', { commentId, replyText, postId: id });
      
      // Validate inputs
      if (!id || !commentId || !replyText.trim()) {
        console.error('Invalid reply data:', { id, commentId, replyText });
        addNotification({
          type: 'error',
          title: 'Lỗi!',
          message: 'Dữ liệu trả lời không hợp lệ.',
          persistent: false
        });
        return;
      }

      // Call API to create reply
      const response = await replyToComment(id, commentId, replyText.trim());
      console.log('Reply response:', response);
      
      // The response should be the new reply comment with parentCommentId
      const newReply = response;
      
      // Map the reply data to expected format
      const mappedReply = {
        _id: newReply._id,
        content: newReply.content,
        text: newReply.content, // Add both for compatibility
        authorId: newReply.authorId,
        author: newReply.authorId ? {
          id: newReply.authorId._id,
          name: newReply.authorId.username,
          avatar: newReply.authorId.avatarUrl || 'https://via.placeholder.com/150',
          isVerified: newReply.authorId.isVerified || false
        } : {
          id: user._id || user.id,
          name: user.username || user.name,
          avatar: user.avatarUrl || user.avatar || 'https://via.placeholder.com/150',
          isVerified: user.isVerified || false
        },
        likes: newReply.likes || [],
        dislikes: newReply.dislikes || [],
        createdAt: newReply.createdAt || new Date().toISOString(),
        parentCommentId: newReply.parentCommentId
      };
      
      console.log('Mapped reply:', mappedReply);
      
      // Update the review state to include the new reply
      setReview(prevReview => ({
        ...prevReview,
        comments: prevReview.comments.map(comment =>
          comment._id === commentId
            ? { ...comment, replies: [...(comment.replies || []), mappedReply] }
            : comment
        )
      }));

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Trả lời thành công!',
        message: 'Trả lời của bạn đã được đăng.',
        persistent: false
      });

    } catch (error) {
      console.error('Failed to reply to comment:', error);
      addNotification({
        type: 'error',
        title: 'Lỗi!',
        message: 'Không thể gửi trả lời. Vui lòng thử lại.',
        persistent: false
      });
    }
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

      await likeReview(id);

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
        title: safeReview?.title,
        text: safeReview?.content?.substring(0, 100) + '...' || 'Check out this review',
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào clipboard!');
    }
  };

  // Check if current user owns this review
  const isReviewOwner = () => {
    if (!user || !review) return false;
    const currentUserId = user._id || user.id;
    const reviewAuthorId = review.authorId?._id || review.authorId;
    return currentUserId === reviewAuthorId;
  };

  const handleEditReview = () => {
    navigate(`/edit-review/${id}`);
  };

  const handleDeleteReview = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReview(id);
      addNotification({
        type: 'success',
        title: 'Đã xóa bài viết!',
        message: 'Bài review của bạn đã được xóa thành công.',
        persistent: false
      });
      // Navigate to home page after successful deletion
      navigate('/');
    } catch (error) {
      console.error('Error deleting review:', error);
      addNotification({
        type: 'error',
        title: 'Lỗi!',
        message: error.response?.data?.message || 'Không thể xóa bài viết. Vui lòng thử lại.',
        persistent: false
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
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
          <p className="text-sm text-gray-500 mb-6">ID: {id}</p>
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

  const contentPreview = (review.content || '').length > 500 ? (review.content || '').substring(0, 500) + '...' : (review.content || '');
  const shouldShowExpand = (review.content || '').length > 500;

  // Fallback values for missing properties
  const safeReview = {
    ...review,
    title: review.title || 'Untitled Review',
    content: review.content || 'No content available',
    coverImageUrl: review.coverImageUrl || review.gameImage || 'https://via.placeholder.com/400x240?text=No+Image',
    gameImage: review.gameImage || review.coverImageUrl || 'https://via.placeholder.com/400x240?text=Game+Image',
    gameName: review.gameName || review.title || 'Unknown Game',
    tags: review.tags || [],
    comments: review.comments || [],
    likes: review.likes || [],
    author: review.author || {
      id: review.authorId?._id || 'unknown',
      name: review.authorId?.username || 'Anonymous',
      avatar: review.authorId?.avatarUrl || 'https://via.placeholder.com/150',
      isVerified: false
    },
    score: review.score || 0,
    views: review.views || 0,
    genres: review.genres || [],
    createdAt: review.createdAt || new Date().toISOString(),
    updatedAt: review.updatedAt || review.createdAt || new Date().toISOString()
  };

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
          <img src={safeReview.gameImage} alt={safeReview.title} className="w-full h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                {safeReview.rating || 'N/A'}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider">{safeReview.genres?.join(', ')}</p>
                <h1 className="text-3xl font-extrabold leading-tight">{safeReview.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <FaGamepad />
                    {safeReview.gameName}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    {new Date(safeReview.createdAt).toLocaleDateString('vi-VN')}
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
              <Link to={`/profile/${safeReview.author?.id}`} className="flex items-center gap-3 hover:text-indigo-600 transition-colors">
                <img src={safeReview.author?.avatar} alt={safeReview.author?.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{safeReview.author?.name}</span>
                    {safeReview.author?.isVerified && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓ Đã xác thực</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {new Date(safeReview.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {safeReview.views || 0} lượt xem
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
                <span className="font-medium">{safeReview.comments?.length || 0} bình luận</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <FaEye className="text-xs" />
                <span className="font-medium">{safeReview.views || 0} lượt xem</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <FaBookmark className="text-xs" />
                <span className="font-medium">{safeReview.saves || 0} đã lưu</span>
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
                  __html: isExpanded ? safeReview.content : contentPreview
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
                      <span className="text-xs">({Math.ceil(((safeReview.content || '').length - 500) / 100)} phút đọc)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

  {}
            <div className="flex items-center justify-between">
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

              {/* Owner Actions */}
              {isReviewOwner() && (
                <div className="relative more-menu-container">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
                    title="Tùy chọn"
                  >
                    <FaEllipsisV />
                  </button>
                  
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-10">
                      <button
                        onClick={() => {
                          handleEditReview();
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <FaEdit className="text-sm" />
                        Chỉnh sửa
                      </button>
                      
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                        >
                          <FaTrashAlt className="text-sm" />
                          Xóa bài viết
                        </button>
                      ) : (
                        <div className="px-4 py-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-2">Xác nhận xóa?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteReview}
                              disabled={isDeleting}
                              className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {isDeleting ? 'Xóa...' : 'Xóa'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          {}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              {safeReview.tags && safeReview.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {safeReview.tags.map((tag, index) => (
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
                    <span>{Math.ceil((safeReview.content || '').length / 200)} phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số từ:</span>
                    <span>{(safeReview.content || '').split(/\s+/).filter(word => word.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cập nhật:</span>
                    <span>{new Date(safeReview.updatedAt || safeReview.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-4">
              <img
                src={safeReview.gameImage}
                alt={safeReview.gameName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{safeReview.gameName}</h4>
                <p className="text-sm text-gray-600">Game được review trong bài viết này</p>
                <button
                  onClick={() => navigate(`/search?q=${safeReview.gameName}`)}
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
          💬 Bình luận ({safeReview.comments?.length || 0})
        </h2>

        {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex gap-4">
              <img
                src={user.avatarUrl || user.avatar || 'https://via.placeholder.com/150?text=User'}
                alt={user.username || user.name || 'User'}
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
          {safeReview.comments && safeReview.comments.length > 0 ? (
            safeReview.comments.map((c, index) => {
              console.log(`Rendering comment ${index}:`, {
                commentObject: c,
                hasId: !!(c._id || c.id),
                id: c._id || c.id,
                key: c._id
              });
              
              return (
                <Comment
                  key={c._id || c.id || `comment-${index}`}
                  comment={c}
                  onLike={handleCommentLike}
                  onDislike={handleCommentDislike}
                  onReply={handleCommentReply}
                  onUpdate={handleCommentUpdate}
                  onDelete={handleCommentDelete}
                />
              );
            })
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
            gameTags={safeReview.tags}
            authorId={safeReview.author?.id}
          />

          {}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">👤 Tác giả</h3>
            <Link
              to={`/profile/${safeReview.author?.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={safeReview.author?.avatar}
                alt={safeReview.author?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900">{safeReview.author?.name}</div>
                <div className="text-sm text-gray-600">
                  {safeReview.author?.isVerified && '✓ Đã xác thực'}
                </div>
              </div>
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{safeReview.author?.totalReviews || 0}</div>
                  <div className="text-xs text-gray-600">Bài viết</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{safeReview.author?.followers || 0}</div>
                  <div className="text-xs text-gray-600">Người theo dõi</div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2">📖 Tiến độ đọc</h4>
            <div className="text-sm text-gray-600 mb-2">
              {isExpanded ? 'Đã đọc đầy đủ' : `Đã đọc ${Math.round((contentPreview.length / (safeReview.content || '').length) * 100)}%`}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: isExpanded ? '100%' : `${Math.round((contentPreview.length / (safeReview.content || '').length) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
