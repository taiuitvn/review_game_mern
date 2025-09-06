import Comment from "../models/Comment.js";
import mongoose from "mongoose";

export const getCommentByPostId = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Get all comments for this post (both top-level and replies)
    const allComments = await Comment.find({ postId })
      .populate('authorId', 'username avatarUrl')
      .sort({ createdAt: -1 });
    
    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(comment => !comment.parentCommentId);
    const replies = allComments.filter(comment => comment.parentCommentId);
    
    // Organize replies under their parent comments
    const commentsWithReplies = topLevelComments.map(comment => {
      const commentReplies = replies.filter(reply => 
        reply.parentCommentId.toString() === comment._id.toString()
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Replies in ascending order
      
      return {
        ...comment.toObject(),
        replies: commentReplies
      };
    });
    
    console.log('Comments found for post:', postId, {
      total: allComments.length,
      topLevel: topLevelComments.length,
      replies: replies.length
    });
    
    res.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(400).json({ error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const authorId = req.user?.id || req.userId;
    
    if (!authorId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!postId || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }
    
    const commentData = {
      postId,
      authorId,
      content: content.trim(),
      parentCommentId: parentCommentId || null // Support for replies
    };
    
    console.log('Creating comment:', commentData);
    
    const newComment = await Comment.create(commentData);
    
    // Populate the comment with author data before returning
    const populatedComment = await Comment.findById(newComment._id)
      .populate('authorId', 'username avatarUrl');
    
    console.log('Created comment:', {
      id: populatedComment._id,
      content: populatedComment.content,
      author: populatedComment.authorId,
      isReply: !!populatedComment.parentCommentId
    });
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(400).json({ error: err.message });
  }
};

export const removeCommentById = async (req, res) => {
  try {
    const commentId = req.params.id;
    const newComment = await Comment.deleteOne({ _id: commentId });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const editCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if comment exists and user owns it
    const existingComment = await Comment.findById(id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (existingComment.authorId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { 
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true } // return the updated document
    ).populate('authorId', 'username avatarUrl');

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(400).json({ error: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    console.log('Like comment request:', {
      commentId: req.params.id,
      userId: req.user?.id || req.userId,
      userObject: req.user
    });
    
    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid comment ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      console.log('Comment not found:', req.params.id);
      return res.status(404).json({ msg: "Comment not found" });
    }

    console.log('Found comment:', {
      id: comment._id,
      likes: comment.likes,
      dislikes: comment.dislikes
    });

    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'User ID not found' });
    }
    
    // Ensure likes and dislikes arrays exist
    if (!comment.likes) comment.likes = [];
    if (!comment.dislikes) comment.dislikes = [];
    
    const likeIndex = comment.likes.indexOf(userId);
    const dislikeIndex = comment.dislikes.indexOf(userId);

    console.log('Like/dislike indices:', { likeIndex, dislikeIndex });

    // Remove from dislikes if present
    if (dislikeIndex !== -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    // Toggle like
    if (likeIndex === -1) {
      comment.likes.push(userId); // Like
      console.log('Added like');
    } else {
      comment.likes.splice(likeIndex, 1); // Unlike
      console.log('Removed like');
    }
    
    await comment.save();
    console.log('Comment saved successfully');
    
    // Populate and return updated comment
    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'username avatarUrl');
    
    console.log('Returning populated comment:', {
      id: populatedComment._id,
      likes: populatedComment.likes?.length,
      dislikes: populatedComment.dislikes?.length
    });
    
    res.json(populatedComment);
  } catch (err) {
    console.error('Error in likeComment:', err);
    res.status(500).json({ error: err.message });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    console.log('Dislike comment request:', {
      commentId: req.params.id,
      userId: req.user?.id || req.userId,
      userObject: req.user
    });
    
    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid comment ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      console.log('Comment not found:', req.params.id);
      return res.status(404).json({ msg: "Comment not found" });
    }

    console.log('Found comment:', {
      id: comment._id,
      likes: comment.likes,
      dislikes: comment.dislikes
    });

    const userId = req.user?.id || req.userId;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'User ID not found' });
    }
    
    // Ensure likes and dislikes arrays exist
    if (!comment.likes) comment.likes = [];
    if (!comment.dislikes) comment.dislikes = [];
    
    const likeIndex = comment.likes.indexOf(userId);
    const dislikeIndex = comment.dislikes.indexOf(userId);

    console.log('Like/dislike indices:', { likeIndex, dislikeIndex });

    // Remove from likes if present
    if (likeIndex !== -1) {
      comment.likes.splice(likeIndex, 1);
    }

    // Toggle dislike
    if (dislikeIndex === -1) {
      comment.dislikes.push(userId); // Dislike
      console.log('Added dislike');
    } else {
      comment.dislikes.splice(dislikeIndex, 1); // Undislike
      console.log('Removed dislike');
    }
    
    await comment.save();
    console.log('Comment saved successfully');
    
    // Populate and return updated comment
    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'username avatarUrl');
    
    console.log('Returning populated comment:', {
      id: populatedComment._id,
      likes: populatedComment.likes?.length,
      dislikes: populatedComment.dislikes?.length
    });
    
    res.json(populatedComment);
  } catch (err) {
    console.error('Error in dislikeComment:', err);
    res.status(500).json({ error: err.message });
  }
};
