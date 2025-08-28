import { useState, useEffect } from 'react';
import { Comment, User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  getCommentById: (commentId: string) => Comment | undefined;
  addComment: (commentData: Omit<Comment, '_id' | 'likes' | 'dislikes' | 'createdAt' | 'author'>) => Comment;
  updateComment: (commentId: string, updateData: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  likeComment: (commentId: string, userId: string) => void;
  unlikeComment: (commentId: string, userId: string) => void;
  dislikeComment: (commentId: string, userId: string) => void;
  undislikeComment: (commentId: string, userId: string) => void;
  isCommentLiked: (commentId: string, userId: string) => boolean;
  isCommentDisliked: (commentId: string, userId: string) => boolean;
}

export const useComments = (postId?: string): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        let filteredComments = mockDB.comments;
        
        // Filter by postId if provided
        if (postId) {
          filteredComments = mockDB.comments.filter(comment => comment.postId === postId);
        }

        // Populate comments with author info
        const commentsWithAuthors = filteredComments.map(comment => {
          const author = mockDB.users.find(user => user._id === comment.authorId) as User;
          return {
            ...comment,
            author: {
              id: author._id,
              name: author.username,
              avatar: author.avatarUrl
            }
          };
        });

        setComments(commentsWithAuthors);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
        setError(errorMessage);
        setLoading(false);
      }
    }, 300);
  }, [postId]);

  const getCommentById = (commentId: string): Comment | undefined => {
    return comments.find(comment => comment._id === commentId);
  };

  const addComment = (commentData: Omit<Comment, '_id' | 'likes' | 'dislikes' | 'createdAt' | 'author'>): Comment => {
    const newComment: Comment = {
      _id: `comment_${Date.now()}`,
      ...commentData,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString(),
      author: {
        id: '',
        name: '',
        avatar: ''
      }
    };

    const author = mockDB.users.find(user => user._id === commentData.authorId) as User;
    const commentWithAuthor: Comment = {
      ...newComment,
      author: {
        id: author._id,
        name: author.username,
        avatar: author.avatarUrl
      }
    };

    setComments(prev => [...prev, commentWithAuthor]);
    return commentWithAuthor;
  };

  const updateComment = (commentId: string, updateData: Partial<Comment>): void => {
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { ...comment, ...updateData }
        : comment
    ));
  };

  const deleteComment = (commentId: string): void => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };

  const likeComment = (commentId: string, userId: string): void => {
    const comment = getCommentById(commentId);
    if (comment && !comment.likes.includes(userId)) {
      // Remove from dislikes if exists
      const newDislikes = comment.dislikes.filter(id => id !== userId);
      updateComment(commentId, {
        likes: [...comment.likes, userId],
        dislikes: newDislikes
      });
    }
  };

  const unlikeComment = (commentId: string, userId: string): void => {
    const comment = getCommentById(commentId);
    if (comment) {
      updateComment(commentId, {
        likes: comment.likes.filter(id => id !== userId)
      });
    }
  };

  const dislikeComment = (commentId: string, userId: string): void => {
    const comment = getCommentById(commentId);
    if (comment && !comment.dislikes.includes(userId)) {
      // Remove from likes if exists
      const newLikes = comment.likes.filter(id => id !== userId);
      updateComment(commentId, {
        dislikes: [...comment.dislikes, userId],
        likes: newLikes
      });
    }
  };

  const undislikeComment = (commentId: string, userId: string): void => {
    const comment = getCommentById(commentId);
    if (comment) {
      updateComment(commentId, {
        dislikes: comment.dislikes.filter(id => id !== userId)
      });
    }
  };

  const isCommentLiked = (commentId: string, userId: string): boolean => {
    const comment = getCommentById(commentId);
    return comment ? comment.likes.includes(userId) : false;
  };

  const isCommentDisliked = (commentId: string, userId: string): boolean => {
    const comment = getCommentById(commentId);
    return comment ? comment.dislikes.includes(userId) : false;
  };

  return {
    comments,
    loading,
    error,
    getCommentById,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    dislikeComment,
    undislikeComment,
    isCommentLiked,
    isCommentDisliked
  };
};
