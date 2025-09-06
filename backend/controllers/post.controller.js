import Post from "../models/Post.js";
import User from "../models/User.js";
import Rating from "../models/Ratings.js";
import { uploadImage } from "../services/uploadImage.js";

export const createPost = async (req, res) => {
  try {
    const { title, content, tags, authorId, imageHash, imageBase64, gameImage, gameName, gameId, rating } = req.body;
    
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
      rating
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

    // Debug logging
    console.log('getAllPosts: Found', posts.length, 'posts');
    if (posts.length > 0) {
      console.log('Sample post structure:', {
        _id: posts[0]._id,
        title: posts[0].title,
        hasId: !!posts[0]._id,
        idType: typeof posts[0]._id
      });
    }

    res.json({
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts,
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
        select: "username email avatarUrl bio createdAt",
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
      });
      
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        error: "No post exists with the provided ID" 
      });
    }
    
    // View counting is handled separately via the incrementPostViews endpoint
    // Do not auto-increment views when fetching post data
    
    // Fetch comments separately
    const Comment = (await import('../models/Comment.js')).default;
    const comments = await Comment.find({ postId: id })
      .populate('authorId', 'username avatarUrl')
      .sort({ createdAt: -1 });
    
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
      commentsCount: comments.length,
      likesCount: post.likes?.length || 0,
      views: post.views,
      authorStats: authorStats ? 'included' : 'none'
    });
    
    // Build enhanced response with author information
    const enhancedPost = {
      ...post.toObject(),
      comments,
      authorStats
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
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) post.likes.push(userId); // Like
    else post.likes.splice(index, 1); // Unlike
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const savePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const index = user.savedPosts.indexOf(post._id);
  if (index === -1) {
    user.savedPosts.push(post._id);
    post.savedBy.push(user._id);
  } else {
    user.savedPosts.splice(index, 1);
    post.savedBy.splice(index, 1);
  }
  await user.save();
  await post.save();
  res.json(user.savedPosts);
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
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments(finalQuery);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // Filter by author if specified (after population)
    let filteredPosts = posts;
    if (author && author !== 'all') {
      filteredPosts = posts.filter(post => 
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
      relevanceScore += (post.rating || 0) * 5;
      
      return {
        ...post.toObject(),
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

    const postsWithScore = await Promise.all(
      posts.map(async (post) => {
        // Lấy rating trung bình
        const ratings = await Rating.find({ postId: post._id });
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
            : 0;

        // Công thức tính điểm trending theo gpt
        const score =
          post.views * 0.4 + (post.likes?.length || 0) * 0.3 + avgRating * 2;

        return {
          ...post,
          avgRating,
          score,
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

// Debug route to check database posts
export const debugPosts = async (req, res) => {
  try {
    const postCount = await Post.countDocuments();
    const posts = await Post.find().limit(5).populate("authorId");
    
    const samplePost = posts.length > 0 ? {
      _id: posts[0]._id,
      title: posts[0].title,
      content: posts[0].content?.substring(0, 100) + '...',
      authorId: posts[0].authorId,
      createdAt: posts[0].createdAt
    } : null;
    
    res.json({
      totalCount: postCount,
      samplePosts: posts.length,
      samplePost,
      allPostIds: posts.map(p => ({ id: p._id, title: p.title }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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