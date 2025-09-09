import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { likeComment, dislikeComment, updateComment } from '../../api/reviews';

const Comment = ({ comment, onLike, onDislike, onReply, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || comment.content || '');
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize like/dislike state
  useEffect(() => {
    if (comment && user) {
      const userId = user._id || user.id;
      setIsLiked(comment.likes?.includes(userId) || false);
      setIsDisliked(comment.dislikes?.includes(userId) || false);
    }
    setLikesCount(Array.isArray(comment.likes) ? comment.likes.length : 0);
    setDislikesCount(Array.isArray(comment.dislikes) ? comment.dislikes.length : 0);
  }, [comment, user]);

  const handleLike = async () => {
    if (!user || isProcessing) return;

    // Debug comment ID before making API call
    const commentId = comment._id || comment.id;
    console.log('Debug comment object:', {
      comment,
      commentId,
      hasId: !!commentId,
      fullObject: comment
    });
    
    if (!commentId) {
      console.error('No comment ID found for like operation');
      alert('Không thể thực hiện thao tác này. ID bình luận không hợp lệ.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Liking comment:', commentId);
      const response = await likeComment(commentId);
      console.log('Like response:', response);
      
      // Update local state based on response
      const userId = user._id || user.id;
      const newIsLiked = response.likes?.includes(userId) || false;
      const newIsDisliked = response.dislikes?.includes(userId) || false;
      
      setIsLiked(newIsLiked);
      setIsDisliked(newIsDisliked);
      setLikesCount(Array.isArray(response.likes) ? response.likes.length : 0);
      setDislikesCount(Array.isArray(response.dislikes) ? response.dislikes.length : 0);
      
      // Call parent handler if provided with updated comment data
      onLike?.(commentId, newIsLiked, response);
    } catch (error) {
      console.error('Error liking comment:', error);
      // Show user-friendly error
      alert('Có lỗi xảy ra khi thích bình luận. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async () => {
    if (!user || isProcessing) return;

    // Debug comment ID before making API call
    const commentId = comment._id || comment.id;
    console.log('Debug comment object for dislike:', {
      comment,
      commentId,
      hasId: !!commentId,
      fullObject: comment
    });
    
    if (!commentId) {
      console.error('No comment ID found for dislike operation');
      alert('Không thể thực hiện thao tác này. ID bình luận không hợp lệ.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Disliking comment:', commentId);
      const response = await dislikeComment(commentId);
      console.log('Dislike response:', response);
      
      // Update local state based on response
      const userId = user._id || user.id;
      const newIsLiked = response.likes?.includes(userId) || false;
      const newIsDisliked = response.dislikes?.includes(userId) || false;
      
      setIsLiked(newIsLiked);
      setIsDisliked(newIsDisliked);
      setLikesCount(Array.isArray(response.likes) ? response.likes.length : 0);
      setDislikesCount(Array.isArray(response.dislikes) ? response.dislikes.length : 0);
      
      // Call parent handler if provided with updated comment data
      onDislike?.(commentId, newIsDisliked, response);
    } catch (error) {
      console.error('Error disliking comment:', error);
      // Show user-friendly error
      alert('Có lỗi xảy ra khi không thích bình luận. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    const commentId = comment._id || comment.id;
    if (!commentId) {
      console.error('No comment ID found for edit operation');
      alert('Không thể chỉnh sửa bình luận. ID không hợp lệ.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await updateComment(commentId, editText.trim());
      
      // Update parent component
      onUpdate?.(commentId, {
        ...response.comment,
        text: response.comment.content || response.comment.text || editText.trim()
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Có lỗi xảy ra khi cập nhật bình luận');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const commentId = comment._id || comment.id;
    if (!commentId) {
      console.error('No comment ID found for reply operation');
      alert('Không thể trả lời bình luận. ID không hợp lệ.');
      return;
    }

    console.log('Submitting reply:', { commentId, replyText });
    setIsProcessing(true);
    
    try {
      // Đợi kết quả từ API trước khi cập nhật UI
      await onReply?.(commentId, replyText);
      console.log('Reply submitted successfully');
      setReplyText('');
      setShowReplyForm(false);
      
      // Thêm timeout để đảm bảo UI được cập nhật sau khi server xử lý
      setTimeout(() => {
        console.log('Checking if reply was added to comment:', commentId);
      }, 1000);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Có lỗi xảy ra khi trả lời bình luận. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if current user owns this comment
  const isOwner = (() => {
    if (!user || !comment) return false;
    
    const currentUserId = user._id || user.id;
    console.log('Checking comment ownership:', {
      currentUserId,
      commentId: comment._id,
      commentAuthorId: comment.authorId,
      commentAuthor: comment.author,
      commentAuthorName: comment.author?.name
    });
    
    // Check multiple possible data structures
    const commentOwnerId = 
      comment.author?._id ||  // Populated author object
      comment.authorId?._id ||  // Populated authorId object
      comment.authorId ||       // Direct authorId string
      comment.author?.id;       // Author object with id
    
    const isOwner = commentOwnerId === currentUserId;
    console.log('Ownership result:', { commentOwnerId, currentUserId, isOwner });
    
    return isOwner;
  })();

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div className="flex gap-4">
        <img
          src={comment.author?.avatarUrl || comment.authorId?.avatarUrl || comment.author?.avatar || 'https://via.placeholder.com/150?text=User'}
          alt={comment.author?.username || comment.authorId?.username || comment.author?.name || 'User'}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150?text=User';
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">
              {comment.authorId?.username || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  disabled={!editText.trim() || isProcessing}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  <FaSave size={12} />
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text || comment.content || '');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  <FaTimes size={12} />
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
              {comment.text || comment.content || 'No content'}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={handleLike}
              disabled={isProcessing}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isLiked
                  ? 'bg-blue-100 text-blue-600'
                  : user
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
              } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
            >
              <FaThumbsUp size={12} />
              <span>Thích ({likesCount})</span>
              {isProcessing && <span className="ml-1 text-xs">...</span>}
            </button>

            <button
              onClick={handleDislike}
              disabled={isProcessing}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isDisliked
                  ? 'bg-red-100 text-red-600'
                  : user
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
                    : 'text-gray-400 cursor-not-allowed'
              } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
            >
              <FaThumbsDown size={12} />
              <span>Không thích ({dislikesCount})</span>
              {isProcessing && <span className="ml-1 text-xs">...</span>}
            </button>

            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 px-2 py-1 rounded text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                <FaReply size={12} />
                <span>Trả lời</span>
              </button>
            )}

            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  <FaEdit size={12} />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete?.(comment._id || comment.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                >
                  <FaTrash size={12} />
                  <span>Xóa</span>
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && user && (
            <form onSubmit={handleReplySubmit} className="mt-4">
              <div className="flex gap-3">
                <img
                  src={user.avatarUrl || user.avatar || 'https://via.placeholder.com/150?text=User'}
                  alt={user.username || user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=User';
                  }}
                />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Trả lời ${comment.author?.username || comment.author?.name || 'người dùng'}...`}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm placeholder-gray-600"
                    rows="2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trả lời
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map(reply => (
                <Comment
                  key={reply._id || reply.id}
                  comment={reply}
                  onLike={onLike}
                  onDislike={onDislike}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
