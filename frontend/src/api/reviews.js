import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    try {
      const parsedProfile = JSON.parse(profile);
      const token = parsedProfile.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing profile from localStorage:', error);
    }
  }
  return config;
});

// Posts/Reviews API functions
export const getAllPosts = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    console.log('getAllPosts API response:', {
      status: response.status,
      data: response.data,
      sample: response.data?.posts?.[0] || response.data?.[0]
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts/create', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const response = await api.put(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const savePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const getSavedPosts = async () => {
  try {
    const response = await api.get('/posts/me/saved');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    throw error;
  }
};

export const getTrendingPosts = async (limit = 10) => {
  try {
    console.log('API: Fetching trending posts with limit:', limit);
    const response = await api.get(`/posts/trending?limit=${limit}`);
    console.log('API: Trending posts response:', {
      status: response.status,
      data: response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    throw error;
  }
};

export const searchPosts = async (title) => {
  try {
    const response = await api.get(`/posts/search/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

// Enhanced search function with filters
export const searchPostsAdvanced = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Add optional filters
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.rating && filters.rating !== 'all') params.append('rating', filters.rating);
    if (filters.tags && filters.tags !== 'all') params.append('tags', filters.tags);
    if (filters.author && filters.author !== 'all') params.append('author', filters.author);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    console.log('Enhanced search params:', params.toString());
    const response = await api.get(`/posts/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
};

// Comments API
export const getCommentsByPostId = async (postId) => {
  try {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const commentOnReview = async (postId, content) => {
  try {
    console.log('API: Creating comment:', { postId, content });
    const response = await api.post('/comments', { postId, content });
    console.log('API: Comment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error commenting on review:', error);
    throw error;
  }
};

export const replyToComment = async (postId, parentCommentId, content) => {
  try {
    console.log('API: Creating reply:', { postId, parentCommentId, content });
    const response = await api.post('/comments', { postId, content, parentCommentId });
    console.log('API: Reply created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error replying to comment:', error);
    throw error;
  }
};

export const likeComment = async (commentId) => {
  try {
    const response = await api.post(`/comments/like/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
};

export const dislikeComment = async (commentId) => {
  try {
    const response = await api.post(`/comments/dislike/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error disliking comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/remove/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const response = await api.put(`/comments/edit/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Post/Review management functions
export const updatePost = async (postId, updateData) => {
  try {
    console.log('API: Updating post:', { postId, updateData });
    const response = await api.put(`/posts/update/${postId}`, updateData);
    console.log('API: Post updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    console.log('API: Deleting post:', postId);
    const response = await api.delete(`/posts/remove/${postId}`);
    console.log('API: Post deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Alias functions for review-specific naming
export const updateReview = updatePost;
export const deleteReview = deletePost;

// Increment view count for a post
export const incrementPostViews = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/view`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing post views:', error);
    throw error;
  }
};

// Alias for reviews (same as posts)
export const getAllReviews = getAllPosts;
export const getReviewById = getPostById;
export const createReview = createPost;
export const likeReview = likePost;
export const saveReview = savePost;
export const getSavedReviews = getSavedPosts;
export const getTrendingReviews = getTrendingPosts;
export const searchReviews = searchPosts;
export const searchPostsByTitle = searchPosts;
export const fetchReviews = getAllPosts;

export default api;