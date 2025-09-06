// User API functions
import api from './reviews';

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Get user posts
export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgRating: 0
    };
  }
};

// Get my profile
export const getMyProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching my profile:', error);
    throw error;
  }
};

// Get my stats
export const getMyStats = async () => {
  try {
    const response = await api.get('/auth/me/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching my stats:', error);
    return {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgRating: 0
    };
  }
};

// Follow user
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/auth/user/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow user
export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`/auth/user/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Update user profile
export const updateUser = async (userId, updates) => {
  try {
    const response = await api.put(`/auth/update/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};