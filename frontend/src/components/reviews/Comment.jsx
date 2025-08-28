import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaThumbsUp, FaThumbsDown, FaReply } from 'react-icons/fa';

const Comment = ({ comment, onLike, onDislike, onReply }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = () => {
    if (!user) return;

    if (isLiked) {
      // Unlike
      setIsLiked(false);
      onLike?.(comment._id, false);
    } else {
      // Like
      setIsLiked(true);
      setIsDisliked(false);
      onLike?.(comment._id, true);
      onDislike?.(comment._id, false);
    }
  };

  const handleDislike = () => {
    if (!user) return;

    if (isDisliked) {
      // Undislike
      setIsDisliked(false);
      onDislike?.(comment._id, false);
    } else {
      // Dislike
      setIsDisliked(true);
      setIsLiked(false);
      onDislike?.(comment._id, true);
      onLike?.(comment._id, false);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReply?.(comment._id, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div className="flex gap-4">
        <img
          src={comment.author?.avatar || 'https://i.pravatar.cc/150?u=default'}
          alt={comment.author?.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{comment.author?.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>
            )}
          </div>

          <p className="text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">{comment.text}</p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isLiked
                  ? 'bg-blue-100 text-blue-600'
                  : user
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaThumbsUp size={12} />
              <span>Thích ({comment.likes || 0})</span>
            </button>

            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isDisliked
                  ? 'bg-red-100 text-red-600'
                  : user
                    ? 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaThumbsDown size={12} />
              <span>Không thích ({comment.dislikes || 0})</span>
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
          </div>

          {/* Reply Form */}
          {showReplyForm && user && (
            <form onSubmit={handleReplySubmit} className="mt-4">
              <div className="flex gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Trả lời ${comment.author?.name}...`}
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
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map(reply => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  onLike={onLike}
                  onDislike={onDislike}
                  onReply={onReply}
                  isReply={true}
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
