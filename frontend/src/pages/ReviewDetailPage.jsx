import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReviewById , commentOnReview, likeReview, deleteComment, incrementPostViews, replyToComment, updateReview, deleteReview, getCommentsByPostId } from '../api/reviews'; 
import { useAuth } from '../hooks';
import { useNotification } from '../contexts/NotificationContext';
import RatingComponent from '../components/reviews/RatingComponent';
import { Popover } from 'react-tiny-popover';
import { FaBookmark, FaRegBookmark, FaHeart, FaShare, FaArrowLeft, FaThumbsUp, FaClock, FaEye, FaComments, FaGamepad, FaCalendarAlt, FaUser, FaEdit, FaTrashAlt, FaEllipsisV } from 'react-icons/fa';
import Comment from '../components/reviews/Comment';
import SuggestedReviews from '../components/reviews/SuggestedReviews';

import { getReadingTime, getWordCount, truncateText } from '../utils/textUtils';

const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, savePost, unsavePost, isPostSaved, likePost } = useAuth();
  const { showNotification } = useNotification();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

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
            isVerified: reviewData.authorId.isVerified || false,
            // Include author statistics from backend authorStats
            totalReviews: reviewData.authorStats?.totalPosts || 0,
            savedPosts: reviewData.authorStats?.savedPostsCount || 0,
            followers: reviewData.authorStats?.followersCount || 0,
            following: reviewData.authorStats?.followingCount || 0,
            totalViews: reviewData.authorStats?.totalViews || 0,
            totalLikes: reviewData.authorStats?.totalLikes || 0,
            totalComments: reviewData.authorStats?.totalComments || 0,
            joinedAt: reviewData.authorStats?.joinedAt || reviewData.authorId.createdAt
          };
        }
        
        // Comment processing is now handled by the backend, so we can remove the frontend logic
        // that was causing the nested structure to be flattened.

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
      // Use savedBy array length for saves count
      setSavesCount(Array.isArray(review.savedBy) ? review.savedBy.length : 0);
    }
  }, [review, user]);

  // Add a useEffect to update like/save counts when the user context changes
  useEffect(() => {
    if (review) {
      // Update saves count based on review's savedBy array
      const currentSavesCount = Array.isArray(review.savedBy) ? review.savedBy.length : 0;
      setSavesCount(currentSavesCount);
      
      // Update likes count based on review's likes array
      const currentLikesCount = Array.isArray(review.likes) ? review.likes.length : 0;
      setLikesCount(currentLikesCount);
      
      // Update like status based on current user
      if (user && review.likes) {
        const userHasLiked = review.likes.includes(user._id || user.id);
        setIsLiked(userHasLiked);
      }
      
      // Update save status based on current user
      if (user && review.savedBy) {
        const userHasSaved = review.savedBy.includes(user._id || user.id);
        // We don't directly set a saved state here since it's managed by the Auth context
        // But we ensure the counts are correct
      }
    }
  }, [user, review]);

  // Separate useEffect to increment view count once when review is loaded
  useEffect(() => {
    let hasIncrementedView = false; // Prevent multiple calls in strict mode
    
    if (review && review._id && !hasIncrementedView) {
      // Check if we've already incremented the view count for this session
      const viewedReviews = JSON.parse(sessionStorage.getItem('viewedReviews') || '[]');
      if (!viewedReviews.includes(review._id)) {
        const incrementView = async () => {
          try {
            console.log('Incrementing view count for review:', review._id);
            await incrementPostViews(review._id);
            hasIncrementedView = true;
            
            // Add to viewed reviews in sessionStorage
            viewedReviews.push(review._id);
            sessionStorage.setItem('viewedReviews', JSON.stringify(viewedReviews));
            
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
    }
  }, [review?._id]); // Only depend on review._id to prevent multiple calls



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
        
        // Map the comment data to expected format that matches backend structure
        // This should match the structure returned by getCommentByPostId in the backend
        const mappedComment = {
          _id: newCommentData._id,
          content: newCommentData.content || newCommentData.text || comment,
          text: newCommentData.content || newCommentData.text || comment,
          authorId: newCommentData.authorId ? {
            _id: newCommentData.authorId._id || newCommentData.authorId,
            username: newCommentData.authorId.username || (user?.username || user?.name),
            avatarUrl: newCommentData.authorId.avatarUrl || user?.avatarUrl || user?.avatar || 'https://via.placeholder.com/150',
            isVerified: newCommentData.authorId.isVerified || user?.isVerified || false
          } : {
            _id: user?._id || user?.id,
            username: user?.username || user?.name,
            avatarUrl: user?.avatarUrl || user?.avatar || 'https://via.placeholder.com/150',
            isVerified: user?.isVerified || false
          },
          author: newCommentData.authorId ? {
            _id: newCommentData.authorId._id || newCommentData.authorId,
            username: newCommentData.authorId.username || (user?.username || user?.name),
            avatarUrl: newCommentData.authorId.avatarUrl || user?.avatarUrl || user?.avatar || 'https://via.placeholder.com/150',
            isVerified: newCommentData.authorId.isVerified || user?.isVerified || false
          } : {
            _id: user?._id || user?.id,
            username: user?.username || user?.name,
            avatarUrl: user?.avatarUrl || user?.avatar || 'https://via.placeholder.com/150',
            isVerified: user?.isVerified || false
          },
          likes: newCommentData.likes || [],
          dislikes: newCommentData.dislikes || [],
          createdAt: newCommentData.createdAt || new Date().toISOString(),
          updatedAt: newCommentData.updatedAt || new Date().toISOString(),
          // Ensure replies array is initialized as empty for new comments
          replies: []
        };
        
        console.log('Mapped comment:', mappedComment);
        
        setReview(prevReview => {
          if (!prevReview) return prevReview;
          
          const updatedReview = {
            ...prevReview,
            comments: [mappedComment, ...(prevReview.comments || [])]
          };
          console.log('Updated review with new comment:', updatedReview);
          return updatedReview;
        });

        // Show notification
        showNotification('Bình luận của bạn đã được đăng.', 'success');

        setComment(''); 
    } catch (error) {
        console.error("Failed to post comment:", error);
        showNotification('Không thể đăng bình luận. Vui lòng thử lại.', 'error');
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
    setReview(prevReview => {
      if (!prevReview) return prevReview;
      
      return {
        ...prevReview,
        comments: prevReview.comments.map(comment => {
          // Check if this is the comment being updated
          if (comment._id === commentId) {
            return {
              ...comment,
              ...updatedComment,
              content: updatedComment.content || updatedComment.text,
              text: updatedComment.content || updatedComment.text,
              author: updatedComment.authorId ? {
                _id: updatedComment.authorId._id || updatedComment.authorId,
                username: updatedComment.authorId.username,
                avatarUrl: updatedComment.authorId.avatarUrl || 'https://via.placeholder.com/150',
                isVerified: updatedComment.authorId.isVerified || false
              } : comment.author,
              isEdited: true
            };
          }
          
          // Check if any of this comment's replies need to be updated
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply._id === commentId) {
                return {
                  ...reply,
                  ...updatedComment,
                  content: updatedComment.content || updatedComment.text,
                  text: updatedComment.content || updatedComment.text,
                  author: updatedComment.authorId ? {
                    _id: updatedComment.authorId._id || updatedComment.authorId,
                    username: updatedComment.authorId.username,
                    avatarUrl: updatedComment.authorId.avatarUrl || 'https://via.placeholder.com/150',
                    isVerified: updatedComment.authorId.isVerified || false
                  } : reply.author,
                  isEdited: true
                };
              }
              return reply;
            });
            
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          
          return comment;
        })
      };
    });
  };

  const handleCommentDelete = (commentId) => {
    setCommentToDelete(commentId);
    setIsDeleteCommentModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    setIsDeletingComment(true);
    try {
      await deleteComment(commentToDelete);
      
      // Update the UI immediately without reloading
      setReview(prevReview => {
        if (!prevReview) return prevReview;
        
        // Remove the comment from the comments array
        const updatedComments = prevReview.comments.filter(comment => {
          // Check if this is the comment being deleted
          if (comment._id === commentToDelete) {
            return false;
          }
          
          // Check if this is a reply to the deleted comment
          if (comment.parentCommentId === commentToDelete) {
            return false;
          }
          
          // Check if any of this comment's replies match the deleted comment
          if (comment.replies) {
            const filteredReplies = comment.replies.filter(reply => reply._id !== commentToDelete);
            // Update the comment with filtered replies
            comment.replies = filteredReplies;
          }
          
          return true;
        });
        
        return {
          ...prevReview,
          comments: updatedComments
        };
      });
      
      showNotification('Bình luận đã được xóa thành công.', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Không thể xóa bình luận. Vui lòng thử lại.', 'error');
    } finally {
      setIsDeletingComment(false);
      setIsDeleteCommentModalOpen(false);
      setCommentToDelete(null);
    }
  };

  // Function to fetch and set comments
  const fetchAndSetComments = async (postId) => {
    try {
      console.log('Fetching comments for post:', postId || id);
      const commentsResponse = await getCommentsByPostId(postId || id);
      const commentsData = commentsResponse?.data || commentsResponse;
      
      console.log('Comments data received from API:', commentsData);
      
      if (Array.isArray(commentsData)) {
        // The backend now returns a perfectly nested structure.
        // We can simplify the frontend logic and just set the comments.
        console.log('Final structured comments with replies from backend:', commentsData);
        
        setReview(prevReview => ({
          ...prevReview,
          comments: commentsData
        }));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCommentReply = async (commentId, replyText) => {
    try {
      console.log('Submitting reply:', { commentId, replyText, postId: id });
      
      // Validate inputs
      if (!id || !commentId || !replyText.trim()) {
        console.error('Invalid reply data:', { id, commentId, replyText });
        showNotification('Dữ liệu trả lời không hợp lệ.', 'error');
        return;
      }
      
      // Đảm bảo commentId là chuỗi
      const parentCommentId = commentId.toString();
      console.log('Converted parentCommentId:', parentCommentId);

      // Call API to create reply
      const response = await replyToComment(id, parentCommentId, replyText.trim());
      console.log('Reply response:', response);
      
      // Show success notification
      showNotification('Trả lời của bạn đã được đăng.', 'success');
      
      // Thêm delay trước khi fetch lại comments để đảm bảo server đã xử lý xong
      setTimeout(async () => {
        console.log('Fetching updated comments after reply');
        await fetchAndSetComments(id);
      }, 1000); // Tăng thời gian delay lên 1 giây
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      showNotification('Không thể gửi trả lời. Vui lòng thử lại.', 'error');
    }
  };

  const handleSaveToggle = async () => {
    if (!user) return;

    const wasSaved = isPostSaved(id);
    
    try {
      // This will update the user context properly
      const response = await savePost(id);
      
      // Update the saves count for immediate UI feedback
      // Get the updated saved status after the API call
      const isNowSaved = !wasSaved; // Since savePost toggles the state
      
      // Update saves count based on API response
      if (response && typeof response === 'object' && response.hasOwnProperty('savedByCount')) {
        // Use the count from the backend response
        setSavesCount(response.savedByCount);
        
        // Also update the review object to reflect the new save status
        setReview(prevReview => {
          if (!prevReview) return prevReview;
          
          // Update the savedBy array in the review object
          let updatedSavedBy = [...(prevReview.savedBy || [])];
          const currentUserId = user._id || user.id;
          
          if (isNowSaved) {
            // Add user to savedBy array if not already there
            if (!updatedSavedBy.includes(currentUserId)) {
              updatedSavedBy.push(currentUserId);
            }
          } else {
            // Remove user from savedBy array
            updatedSavedBy = updatedSavedBy.filter(id => id !== currentUserId);
          }
          
          return {
            ...prevReview,
            savedBy: updatedSavedBy
          };
        });
      } else {
        // Fallback to local calculation
        setSavesCount(prevCount => isNowSaved ? prevCount + 1 : prevCount - 1);
      }
      
      showNotification(
        isNowSaved 
          ? 'Bài viết đã được thêm vào danh sách đã lưu.' 
          : 'Bài viết đã được bỏ khỏi danh sách đã lưu.', 
        isNowSaved ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Failed to toggle save:', error);
      showNotification('Không thể cập nhật trạng thái lưu. Vui lòng thử lại.', 'error');
    }
  };

  const handleLikeToggle = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    const previousLikedState = isLiked;
    const previousLikesCount = likesCount;

    try {
      // Optimistically update UI
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Call API and get updated data
      const response = await likePost(id);
      console.log('Like response:', response);

      // Update counts based on response
      if (response && typeof response === 'object') {
        // Handle both possible response formats
        if (response.hasOwnProperty('likesCount')) {
          // New API response format
          setLikesCount(response.likesCount || 0);
          setIsLiked(response.isLiked || false);
          
          // Also update the review object to reflect the new like status
          setReview(prevReview => {
            if (!prevReview) return prevReview;
            
            // Update the likes array in the review object
            let updatedLikes = [...(prevReview.likes || [])];
            const currentUserId = user._id || user.id;
            
            if (response.isLiked) {
              // Add user to likes array if not already there
              if (!updatedLikes.includes(currentUserId)) {
                updatedLikes.push(currentUserId);
              }
            } else {
              // Remove user from likes array
              updatedLikes = updatedLikes.filter(id => id !== currentUserId);
            }
            
            return {
              ...prevReview,
              likes: updatedLikes
            };
          });
        } else if (response.hasOwnProperty('likes')) {
          // Direct post data response
          const updatedLikes = response.likes || [];
          setLikesCount(updatedLikes.length);
          // Check if current user is in the likes array
          const userHasLiked = updatedLikes.includes(user._id || user.id);
          setIsLiked(userHasLiked);
          
          // Also update the review object
          setReview(prevReview => {
            if (!prevReview) return prevReview;
            return {
              ...prevReview,
              likes: updatedLikes
            };
          });
        }
      }

      showNotification(
        newIsLiked ? 'Cảm ơn bạn đã ủng hộ tác giả.' : 'Đã bỏ thích bài viết.',
        newIsLiked ? 'success' : 'info'
      );

    } catch (error) {
      // Revert on error
      setIsLiked(previousLikedState);
      setLikesCount(previousLikesCount);

      console.error('Failed to toggle like:', error);
      showNotification('Không thể thực hiện hành động này. Vui lòng thử lại.', 'error');
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
    setIsDeleting(true);
    try {
      await deleteReview(id);
      showNotification('Bài review của bạn đã được xóa thành công.', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error deleting review:', error);
      showNotification(error.response?.data?.message || 'Không thể xóa bài viết. Vui lòng thử lại.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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

  const contentPreview = truncateText(review.content, 500);
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
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <FaArrowLeft />
        <span>Quay lại trang chủ</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img src={safeReview.gameImage} alt={safeReview.title} className="w-full h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                {safeReview.avgRating !== undefined && safeReview.avgRating > 0 
                  ? `${Math.round(safeReview.avgRating)}`
                : `${safeReview.rating || 0}`
                }
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

        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
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
                      {review?.views || 0} lượt xem
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                <FaHeart className="text-xs" />
                <span className="font-medium">{likesCount} thích</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                <FaComments className="text-xs" />
                <span className="font-medium">{review?.comments?.length || 0} bình luận</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <FaEye className="text-xs" />
                <span className="font-medium">{review?.views || 0} lượt xem</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <FaBookmark className="text-xs" />
                <span className="font-medium">{savesCount} đã lưu</span>
              </div>
            </div>
          </div>
        </div>

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={handleLikeToggle}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'hover:bg-red-50 hover:text-red-500 text-gray-600'
                  }`}
                  title={isLiked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
                >
                  <FaHeart className={isLiked ? 'text-red-600' : ''} />
                  <span className="hidden sm:inline">{likesCount}</span>
                </button>
              )}

              {user && (
                <button
                  onClick={handleSaveToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isPostSaved(id)
                      ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                      : 'hover:bg-gray-100 hover:text-indigo-600 text-gray-600'
                  }`}
                  title={isPostSaved(id) ? 'Bỏ lưu' : 'Lưu bài viết'}
                >
                  {isPostSaved(id) ? <FaBookmark /> : <FaRegBookmark />}
                  <span className="hidden sm:inline">Lưu</span>
                </button>
              )}

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
              <Popover
                isOpen={isMoreMenuOpen}
                position={['bottom', 'right']}
                padding={10}
                onClickOutside={() => setIsMoreMenuOpen(false)}
                content={(
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-10">
                    <button
                      onClick={() => {
                        handleEditReview();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <FaEdit className="text-sm" />
                      Chỉnh sửa
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <FaTrashAlt className="text-sm" />
                      Xóa bài viết
                    </button>
                  </div>
                )}
              >
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
                  title="Tùy chọn"
                >
                  <FaEllipsisV />
                </button>
              </Popover>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

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

          {/* Rating Section */}
          <div className="mt-6">
            <RatingComponent 
              postId={id} 
              onRatingUpdate={(ratingData) => {
                // Optional: Update any local state if needed
                console.log('Rating updated:', ratingData);
              }}
            />
          </div>
        </div>
      </article>



      {/* Comments Section */}
      <section className="mt-8 bg-white rounded-lg shadow-lg p-6">
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
            safeReview.comments
              .map((c, index) => {
                console.log(`Rendering comment ${index}:`, {
                  commentObject: c,
                  hasId: !!(c._id || c.id),
                  id: c._id || c.id,
                  key: c._id,
                  hasReplies: !!(c.replies && c.replies.length),
                  repliesCount: c.replies ? c.replies.length : 0,
                  replies: c.replies
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

        </div>

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
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{safeReview.author?.totalReviews || 0}</div>
                  <div className="text-xs text-gray-600">Bài viết</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{safeReview.author?.savedPosts || 0}</div>
                  <div className="text-xs text-gray-600">đã lưu</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold text-green-600">{safeReview.author?.followers || 0}</div>
                  <div className="text-xs text-gray-600">Người theo dõi</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{safeReview.author?.following || 0}</div>
                  <div className="text-xs text-gray-600">Đang theo dõi</div>
                </div>
              </div>
              
              {/* Additional stats if available */}
              {(safeReview.author?.totalViews > 0 || safeReview.author?.totalLikes > 0) && (
                <div className="grid grid-cols-2 gap-4 text-center pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{safeReview.author?.totalViews?.toLocaleString() || 0}</div>
                    <div className="text-xs text-gray-600">Lượt xem</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{safeReview.author?.totalLikes?.toLocaleString() || 0}</div>
                    <div className="text-xs text-gray-600">Lượt thích</div>
                  </div>
                </div>
              )}
              
              {/* Join date if available */}
              {safeReview.author?.joinedAt && (
                <div className="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-100">
                  Tham gia từ {new Date(safeReview.author.joinedAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          </div>

          {}

        </div>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bài review này không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                        disabled={isDeleting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDeleteReview}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )}
    {isDeleteCommentModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa bình luận</h3>
                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setIsDeleteCommentModalOpen(false);
                            setCommentToDelete(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                        disabled={isDeletingComment}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={confirmDeleteComment}
                        disabled={isDeletingComment}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isDeletingComment ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
  );
};

export default ReviewDetailPage;
