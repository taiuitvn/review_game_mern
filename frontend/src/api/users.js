import api from './index';

// User API functions
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const getFollowers = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}/followers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user followers:', error);
    throw error;
  }
};

export const getMyProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching my profile:', error);
    throw error;
  }
};

export const getMyStats = async () => {
  try {
    const response = await api.get('/auth/me/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching my stats:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/auth/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await api.post(`/auth/user/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`/auth/user/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    const params = {
      q: query,  // Changed from 'query' to 'q' to match backend expectation
      page,
      limit
    };
    
    const response = await api.get('/auth/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const uploadImage = async (imageFile) => {
  try {
    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    // Send to backend upload endpoint
    const response = await api.post('/upload/image', { image: base64 });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default api;