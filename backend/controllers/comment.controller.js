import Comment from "../models/Comment.js";
import mongoose from "mongoose";
import { createNotificationHelper } from "./notification.controller.js";

export const getCommentByPostId = async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('Fetching comments for post:', postId);

    const allComments = await Comment.find({ postId })
      .populate('authorId', 'username avatarUrl isVerified')
      .sort({ createdAt: 'asc' }) // Sort by oldest first to build the tree correctly
      .lean(); // Use .lean() for better performance with plain JS objects

    console.log(`Found ${allComments.length} total comments.`);

    const commentMap = {};
    
    // First pass: create a map and initialize replies array
    allComments.forEach(comment => {
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    const commentTree = [];
    
    // Second pass: build the tree
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentComment = commentMap[comment.parentCommentId.toString()];
        if (parentComment) {
          // This is a reply, add it to its parent's replies array
          parentComment.replies.push(comment);
        } else {
          // Orphan reply, treat it as a top-level comment
          commentTree.push(comment);
        }
      } else {
        // This is a top-level comment
        commentTree.push(comment);
      }
    });
    
    // The tree is built, now sort the top-level comments by newest first for display
    commentTree.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Returning ${commentTree.length} top-level comments.`);
    
    res.json(commentTree);
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
    
    // Validate parentCommentId if provided
    let finalParentCommentId = null;
    if (parentCommentId) {
      try {
        if (mongoose.Types.ObjectId.isValid(parentCommentId)) {
          // Check if parent comment exists
          const parentComment = await Comment.findById(parentCommentId);
          if (parentComment) {
            finalParentCommentId = parentCommentId;
            console.log('Parent comment verified:', parentCommentId);
          } else {
            console.error('Parent comment not found in database:', parentCommentId);
          }
        } else {
          console.error('Invalid parent comment ID format:', parentCommentId);
        }
      } catch (err) {
        console.error('Error validating parent comment:', err.message);
      }
    }
    
    const commentData = {
      postId,
      authorId,
      content: content.trim(),
      parentCommentId: finalParentCommentId // Use validated parent comment ID
    };
    
    console.log('Creating comment:', commentData);
    console.log('ParentCommentId type:', finalParentCommentId ? typeof finalParentCommentId : 'null');
    
    const newComment = await Comment.create(commentData);
    
    // Populate the comment with author data before returning
    const populatedComment = await Comment.findById(newComment._id)
      .populate('authorId', 'username avatarUrl');
    
    console.log('Created comment:', {
      id: populatedComment._id,
      content: populatedComment.content,
      author: populatedComment.authorId,
      isReply: !!populatedComment.parentCommentId,
      parentCommentId: populatedComment.parentCommentId
    });
    
    // Create notifications
    try {
      // Get post information
      const Post = (await import('../models/Post.js')).default;
      const post = await Post.findById(postId).populate('authorId', '_id username');
      
      if (post) {
        if (finalParentCommentId) {
          // This is a reply - notify the original comment author
          const parentComment = await Comment.findById(finalParentCommentId).populate('authorId', '_id username');
          console.log('Parent comment found:', parentComment ? parentComment._id.toString() : 'not found');
          
          if (parentComment && parentComment.authorId._id.toString() !== authorId) {
            await createNotificationHelper({
              userId: parentComment.authorId._id,
              fromUserId: authorId,
              type: 'reply',
              title: 'Phản hồi bình luận',
              message: `đã phản hồi bình luận của bạn trong "${post.title}"`,
              postId: post._id,
              commentId: newComment._id,
              data: {
                postTitle: post.title,
                parentCommentContent: parentComment.content.substring(0, 50)
              }
            });
            console.log('Reply notification created');
          } else {
            console.log('No notification needed - user replying to own comment or parent comment not found');
          }
        } else {
          // This is a new comment - notify the post author
          if (post.authorId && post.authorId._id.toString() !== authorId) {
            await createNotificationHelper({
              userId: post.authorId._id,
              fromUserId: authorId,
              type: 'comment',
              title: 'Bình luận mới',
              message: `đã bình luận về bài viết "${post.title}" của bạn`,
              postId: post._id,
              commentId: newComment._id,
              data: {
                postTitle: post.title,
                commentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
              }
            });
            console.log('Comment notification created');
          }
        }
      }
    } catch (notifError) {
      console.error('Error creating comment notification:', notifError);
      // Don't fail the comment creation if notification fails
    }
    
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
