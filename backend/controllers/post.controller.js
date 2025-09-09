import Post from "../models/Post.js";
import User from "../models/User.js";
import Rating from "../models/Ratings.js";
import { uploadImage } from "../services/uploadImage.js";
import { createNotificationHelper } from "./notification.controller.js";

export const createPost = async (req, res) => {
  try {
    const { title, content, tags, authorId, imageHash, imageBase64, gameImage, gameName, gameId, rating, platforms, genres } = req.body;
    
    console.log('createPost: Received data:', {
      title,
      platforms: platforms,
      genres: genres,
      gameId,
      gameName
    });
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        message: "Title and content are required",
        error: "Missing required fields" 
      });
    }

    let coverImageUrl;
    let publicId;

    // Handle image upload or use game image
    if (imageBase64 && imageHash) {
      const existingPost = await Post.findOne({ imageHash });
      
      if (existingPost) {
        // Reuse existing image
        coverImageUrl = existingPost.coverImageUrl;
        publicId = existingPost.publicId;
      } else {
        // Upload new image
        const uploaded = await uploadImage(imageBase64, "image_grv");
        coverImageUrl = uploaded.url;
        publicId = uploaded.public_id;
      }
    } else if (gameImage) {
      // Use game image from RAWG API
      coverImageUrl = gameImage;
      publicId = null;
    }

    const newPost = await Post.create({
      title: title.trim(),
      content,
      tags: Array.isArray(tags) ? tags : [],
      authorId: authorId || req.user?.id || req.userId,
      coverImageUrl,
      publicId,
      imageHash,
      // Store additional game-related metadata
      gameId,
      gameName,
      rating,
      platforms: Array.isArray(platforms) ? platforms : [], // Add platform data
      genres: Array.isArray(genres) ? genres : [], // Add genre data
    });

    // Populate author data before returning
    const populatedPost = await Post.findById(newPost._id)
      .populate('authorId', 'username email avatarUrl');

    console.log('Created post:', {
      id: populatedPost._id,
      title: populatedPost.title,
      author: populatedPost.authorId?.username,
      tags: populatedPost.tags
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populatedPost
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ 
      message: "Server error while creating post",
      error: err.message 
    });
  }
};

export const updatePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ 
        message: "Authentication required",
        error: "You must be logged in to update a post" 
      });
    }

    // First, find the post to check ownership
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user owns this post
    if (existingPost.authorId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Access denied",
        error: "You can only edit your own posts" 
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date() // Ensure updatedAt is set
      },
      { new: true } // return the updated document
    ).populate('authorId', 'username email avatarUrl');

    console.log('Post updated successfully:', {
      id: updatedPost._id,
      title: updatedPost.title,
      author: updatedPost.authorId?.username,
      updatedBy: userId
    });

    res.json({ 
      success: true,
      message: "Post updated successfully", 
      data: updatedPost 
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: "Server error while updating post", 
      error: error.message 
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // Lấy page và limit từ query, mặc định page=1, limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Đếm tổng số posts để tính tổng số trang
    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId");

    // Add average rating calculation and comment count for each post
    const Comment = (await import('../models/Comment.js')).default;
    const postsWithRatings = await Promise.all(
      posts.map(async (post) => {
        const ratings = await Rating.find({ postId: post._id });
        
        // Debug rating values
        if (ratings.length > 0) {
          console.log('Rating values for post', post._id, ':', ratings.map(r => r.value));
          console.log('Full rating objects:', ratings.map(r => ({ id: r._id, value: r.value, rating: r.rating, postId: r.postId, userId: r.userId })));
        }
        
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => {
              const value = r.value || 0;
              return sum + value;
            }, 0) / ratings.length
          : 0;
        
        // Count comments for this post
        const commentCount = await Comment.countDocuments({ postId: post._id });
        
        return {
          ...(post.toObject ? post.toObject() : post),
          avgRating: Math.round(avgRating),
          totalRatings: ratings.length,
          comments: commentCount
        };
      })
    );

    // Debug logging
    console.log('getAllPosts: Found', postsWithRatings.length, 'posts');
    if (postsWithRatings.length > 0) {
      console.log('Sample post structure:', {
      _id: postsWithRatings[0]._id,
      title: postsWithRatings[0].title,
      hasId: !!postsWithRatings[0]._id,
      idType: typeof postsWithRatings[0]._id,
      rating: postsWithRatings[0].rating,
      avgRating: postsWithRatings[0].avgRating,
      totalRatings: postsWithRatings[0].totalRatings
    });
    }

    res.json({
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts: postsWithRatings,
    });
  } catch (err) {
    console.error('Error in getAllPosts:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "Invalid post ID format", 
        error: "Post ID must be a valid 24-character hex string" 
      });
    }

    // Fetch post with enhanced author information
    const post = await Post.findById(id)
      .populate({
        path: "authorId",
        select: "username email avatarUrl bio createdAt savedPosts followers following",
        populate: [
          {
            path: "followers",
            select: "username avatarUrl"
          },
          {
            path: "following", 
            select: "username avatarUrl"
          }
        ]
      })
      .populate({
        path: "savedBy",
        select: "username avatarUrl"
      });
      
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        error: "No post exists with the provided ID" 
      });
    }
    
    // View counting is handled separately via the incrementPostViews endpoint
    // Do not auto-increment views when fetching post data
    
    // Fetch and build nested comments
    const Comment = (await import('../models/Comment.js')).default;
    const allComments = await Comment.find({ postId: id })
      .populate('authorId', 'username avatarUrl isVerified')
      .sort({ createdAt: 'asc' })
      .lean();

    const commentMap = {};
    allComments.forEach(comment => {
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    const commentTree = [];
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentComment = commentMap[comment.parentCommentId.toString()];
        if (parentComment) {
          parentComment.replies.push(comment);
        } else {
          commentTree.push(comment);
        }
      } else {
        commentTree.push(comment);
      }
    });

    commentTree.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    

    
    // Get author statistics if author exists
    let authorStats = null;
    if (post.authorId) {
      const authorId = post.authorId._id;
      
      // Get author's posts for statistics
      const authorPosts = await Post.find({ authorId })
        .select('views likes createdAt')
        .lean();
      
      // Calculate author statistics
      const totalViews = authorPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = authorPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
      
      // Get total comments on author's posts
      const authorPostIds = authorPosts.map(p => p._id);
      const totalComments = await Comment.countDocuments({ postId: { $in: authorPostIds } });
      
      // Get recent posts by author (excluding current post)
      const recentPosts = await Post.find({ 
        authorId, 
        _id: { $ne: id } 
      })
        .select('title gameName rating createdAt views likes')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      authorStats = {
        totalPosts: authorPosts.length,
        totalViews,
        totalLikes,
        totalComments,
        savedPostsCount: post.authorId.savedPosts?.length || 0,
        followersCount: post.authorId.followers?.length || 0,
        followingCount: post.authorId.following?.length || 0,
        joinedAt: post.authorId.createdAt,
        recentPosts
      };
    }
    
    console.log('Found post:', {
      id: post._id,
      title: post.title,
      author: post.authorId?.username,
      hasAuthor: !!post.authorId,
      commentsCount: allComments.length,
      likesCount: post.likes?.length || 0,
      views: post.views,
      authorStats: authorStats ? 'included' : 'none',
      authorStatsData: authorStats
    });
    
    // Calculate average rating for this post
    const ratings = await Rating.find({ postId: id });
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;
    const totalRatings = ratings.length;
    
    console.log('Rating calculation:', {
      postId: id,
      totalRatings,
      avgRating: Math.round(avgRating)
    });
    
    // Build enhanced response with author information
    const enhancedPost = {
      ...(post.toObject ? post.toObject() : post),
      comments: commentTree, // Use the nested comment tree
      authorStats,
      avgRating: Math.round(avgRating),
      totalRatings
    };
    
    // Add user's like status if user is authenticated
    if (req.user?.id) {
      enhancedPost.isLiked = post.likes?.includes(req.user.id) || false;
      
      // Check if current user is following the author
      if (post.authorId && post.authorId.followers) {
        enhancedPost.isFollowingAuthor = post.authorId.followers.some(
          follower => follower._id?.toString() === req.user.id
        );
      }
      
      console.log('User interaction status:', {
        userId: req.user.id,
        isLiked: enhancedPost.isLiked,
        isFollowingAuthor: enhancedPost.isFollowingAuthor
      });
    }
    
    res.json({
      success: true,
      data: enhancedPost
    });
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    res.status(500).json({ 
      message: "Server error while fetching post", 
      error: err.message 
    });
  }
};

// Increment view count for a post
export const incrementPostViews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "Invalid post ID format", 
        error: "Post ID must be a valid 24-character hex string" 
      });
    }

    const post = await Post.findByIdAndUpdate(
      id, 
      { $inc: { views: 1 } }, 
      { new: true, select: 'views' }
    );
    
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        error: "No post exists with the provided ID" 
      });
    }
    
    console.log('Incremented views for post:', {
      id: post._id,
      newViewCount: post.views
    });
    
    res.json({
      success: true,
      views: post.views
    });
  } catch (err) {
    console.error('Error incrementing post views:', err);
    res.status(500).json({ 
      message: "Server error while incrementing views", 
      error: err.message 
    });
  }
};

export const removePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ 
        message: "Authentication required",
        error: "You must be logged in to delete a post" 
      });
    }

    // First, find the post to check ownership
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ 
        message: "Post not found",
        error: "No post exists with the provided ID" 
      });
    }

    // Check if the user owns this post
    if (existingPost.authorId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Access denied",
        error: "You can only delete your own posts" 
      });
    }

    // Delete the post
    const deletedPost = await Post.deleteOne({ _id: id });
    
    console.log('Post deleted successfully:', {
      id,
      title: existingPost.title,
      author: existingPost.authorId,
      deletedBy: userId
    });

    // Also delete related comments
    const Comment = (await import('../models/Comment.js')).default;
    await Comment.deleteMany({ postId: id });
    
    console.log('Related comments deleted for post:', id);

    res.json({
      success: true,
      message: "Post and related comments deleted successfully",
      data: deletedPost
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      message: "Server error while deleting post", 
      error: error.message 
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('authorId', 'username');
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);
    
    let isLiked = false;

    if (index === -1) {
      // Like the post
      post.likes.push(userId);
      isLiked = true;
      
      // Create notification if user is not liking their own post
      if (post.authorId && post.authorId._id.toString() !== userId) {
        try {
          await createNotificationHelper({
            userId: post.authorId._id,
            fromUserId: userId,
            type: 'like',
            title: 'Bài viết được thích',
            message: `đã thích bài viết "${post.title}" của bạn`,
            postId: post._id,
            data: { 
              postTitle: post.title,
              gameName: post.gameName 
            }
          });
          console.log('Like notification created for post:', post._id);
        } catch (notifError) {
          console.error('Error creating like notification:', notifError);
          // Don't fail the like operation if notification fails
        }
      }
    } else {
      // Unlike the post
      post.likes.splice(index, 1);
      isLiked = false;
    }
    
    await post.save();
    
    console.log('Post like action:', {
      postId: post._id,
      userId,
      action: isLiked ? 'liked' : 'unliked',
      totalLikes: post.likes.length
    });
    
    res.json({
      success: true,
      isLiked,
      likesCount: post.likes.length,
      data: post
    });
  } catch (err) {
    console.error('Error in likePost:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

export const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userSavedIndex = user.savedPosts.indexOf(post._id);
    let isSaved = false;
    
    if (userSavedIndex === -1) {
      // Save the post
      user.savedPosts.push(post._id);
      post.savedBy.push(user._id);
      isSaved = true;
    } else {
      // Unsave the post
      user.savedPosts.splice(userSavedIndex, 1);
      // Find the correct index in post.savedBy array
      const postSavedIndex = post.savedBy.indexOf(user._id);
      if (postSavedIndex !== -1) {
        post.savedBy.splice(postSavedIndex, 1);
      }
      isSaved = false;
    }
    
    await user.save();
    await post.save();
    
    res.json({
      success: true,
      isSaved,
      savedByCount: post.savedBy.length,
      userSavedPosts: user.savedPosts
    });
  } catch (error) {
    console.error('Error in savePost:', error);
    res.status(500).json({ 
      message: "Server error while saving post", 
      error: error.message 
    });
  }
};

export const getPostByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    // Search for multiple posts that match the title (case insensitive)
    const posts = await Post.find({
      title: { $regex: new RegExp(title, "i") },
    }).populate("authorId").sort({ createdAt: -1 });

    // Return array of posts instead of single post
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enhanced search function for multiple fields
export const searchPosts = async (req, res) => {
  try {
    const { q: query } = req.query;
    const {
      sortBy = 'relevance',
      rating,
      dateFrom,
      dateTo,
      tags,
      author,
      page = 1,
      limit = 20
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        message: "Search query is required",
        error: "Please provide a search term" 
      });
    }

    // Build search conditions
    const searchConditions = {
      $or: [
        // Search in title (highest priority)
        { title: { $regex: new RegExp(query, "i") } },
        // Search in content
        { content: { $regex: new RegExp(query, "i") } },
        // Search in tags (exact match and partial)
        { tags: { $regex: new RegExp(query, "i") } },
        // Search in game name
        { gameName: { $regex: new RegExp(query, "i") } }
      ]
    };

    // Add additional filters
    const additionalFilters = {};

    // Rating filter
    if (rating && rating !== 'all') {
      if (rating === '5') {
        additionalFilters.rating = 5;
      } else if (rating === '4+') {
        additionalFilters.rating = { $gte: 4 };
      } else if (rating === '3+') {
        additionalFilters.rating = { $gte: 3 };
      } else if (rating === '2+') {
        additionalFilters.rating = { $gte: 2 };
      } else if (rating === '1+') {
        additionalFilters.rating = { $gte: 1 };
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      additionalFilters.createdAt = {};
      if (dateFrom) {
        additionalFilters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        additionalFilters.createdAt.$lte = new Date(dateTo);
      }
    }

    // Tags filter (if specific tags are provided)
    if (tags && tags !== 'all') {
      const tagList = tags.split(',').map(tag => tag.trim());
      additionalFilters.tags = { $in: tagList };
    }

    // Combine search conditions with filters
    const finalQuery = {
      ...searchConditions,
      ...additionalFilters
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with population
    let postsQuery = Post.find(finalQuery)
      .populate('authorId', 'username email avatarUrl')
      .skip(skip)
      .limit(parseInt(limit));

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        postsQuery = postsQuery.sort({ createdAt: -1 });
        break;
      case 'oldest':
        postsQuery = postsQuery.sort({ createdAt: 1 });
        break;
      case 'rating':
        postsQuery = postsQuery.sort({ rating: -1, createdAt: -1 });
        break;
      case 'views':
        postsQuery = postsQuery.sort({ views: -1, createdAt: -1 });
        break;
      case 'likes':
        postsQuery = postsQuery.sort({ 'likes.length': -1, createdAt: -1 });
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by a combination of factors
        postsQuery = postsQuery.sort({ 
          createdAt: -1 // For now, use newest as default relevance
        });
        break;
    }

    const posts = await postsQuery;
    
    // Add average rating calculation and comment count for each post
    const Comment = (await import('../models/Comment.js')).default;
    const postsWithRatings = await Promise.all(
      posts.map(async (post) => {
        const ratings = await Rating.find({ postId: post._id });
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          : 0;
        
        // Count comments for this post
        const commentCount = await Comment.countDocuments({ postId: post._id });
        
        return {
        ...(post.toObject ? post.toObject() : post),
          avgRating: Math.round(avgRating),
          totalRatings: ratings.length,
          comments: commentCount
        };
      })
    );
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments(finalQuery);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // Filter by author if specified (after population)
    let filteredPosts = postsWithRatings;
    if (author && author !== 'all') {
      filteredPosts = postsWithRatings.filter(post => 
        post.authorId?.username?.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Calculate relevance scores for better sorting
    const postsWithRelevance = filteredPosts.map(post => {
      let relevanceScore = 0;
      const queryLower = query.toLowerCase();
      
      // Title match (highest weight)
      if (post.title?.toLowerCase().includes(queryLower)) {
        relevanceScore += post.title.toLowerCase() === queryLower ? 100 : 50;
      }
      
      // Game name match
      if (post.gameName?.toLowerCase().includes(queryLower)) {
        relevanceScore += post.gameName.toLowerCase() === queryLower ? 80 : 30;
      }
      
      // Tags match
      if (post.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
        relevanceScore += 20;
      }
      
      // Content match (lower weight)
      if (post.content?.toLowerCase().includes(queryLower)) {
        relevanceScore += 10;
      }
      
      // Boost popular posts
      relevanceScore += (post.likes?.length || 0) * 2;
      relevanceScore += (post.views || 0) * 0.1;
      relevanceScore += (post.avgRating || 0) * 5;
      
      return {
        ...(post.toObject ? post.toObject() : post),
        relevanceScore
      };
    });

    // Sort by relevance if that's the selected sort
    if (sortBy === 'relevance') {
      postsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Remove relevance score from final output
    const finalPosts = postsWithRelevance.map(({ relevanceScore, ...post }) => post);

    console.log('Enhanced search results:', {
      query,
      filters: { rating, dateFrom, dateTo, tags, author, sortBy },
      totalFound: totalPosts,
      returnedCount: finalPosts.length,
      page: parseInt(page),
      totalPages
    });

    res.json({
      success: true,
      data: {
        posts: finalPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts: filteredPosts.length,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        searchInfo: {
          query,
          appliedFilters: {
            rating: rating || 'all',
            tags: tags || 'all',
            author: author || 'all',
            sortBy,
            dateRange: { from: dateFrom, to: dateTo }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error in enhanced search:', err);
    res.status(500).json({ 
      message: "Server error during search",
      error: err.message 
    });
  }
};

// Lấy danh sách bài viết trending
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find().populate("authorId", "username").lean();

    const Comment = (await import('../models/Comment.js')).default;
    const postsWithScore = await Promise.all(
      posts.map(async (post) => {
        // Lấy rating trung bình
        const ratings = await Rating.find({ postId: post._id });
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
            : 0;

        // Count comments for this post
        const commentCount = await Comment.countDocuments({ postId: post._id });

        // Công thức tính điểm trending theo gpt
        const score =
          post.views * 0.4 + (post.likes?.length || 0) * 0.3 + avgRating * 2;

        return {
          ...post,
          avgRating,
          score,
          comments: commentCount,
        };
      })
    );

    // Sắp xếp score giảm dần
    postsWithScore.sort((a, b) => b.score - a.score);

    res.json(postsWithScore.slice(0, limit));
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};



export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId; // đã gắn sẵn từ middleware auth

    const posts = await Post.find({ savedBy: userId })
      .populate("authorId", "username email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get posts by genre
export const getPostsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ 
      genres: { $in: [genre] } 
    })
    .populate('authorId', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
    const total = await Post.countDocuments({ genres: { $in: [genre] } });
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by platform
export const getPostsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.find({ 
      platforms: { $in: [platform] } 
    })
    .populate('authorId', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
    const total = await Post.countDocuments({ platforms: { $in: [platform] } });
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available genres
export const getAllGenres = async (req, res) => {
  try {
    const genres = await Post.distinct('genres');
    res.status(200).json(genres.filter(genre => genre && genre.trim() !== ''));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available platforms
export const getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Post.distinct('platforms');
    res.status(200).json(platforms.filter(platform => platform && platform.trim() !== ''));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};