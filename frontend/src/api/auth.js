// Auth API functions
import api from './reviews';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const getMyProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get profile API error:', error);
    throw error;
  }
};

export const updateProfile = async (updates) => {
  try {
    const response = await api.put('/auth/update', updates);
    return response.data;
  } catch (error) {
    console.error('Update profile API error:', error);
    throw error;
  }
};

// Alias for compatibility with useAuth hook
export const updateUser = async (userId, updates) => {
  try {
    const response = await api.put(`/auth/update/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update user API error:', error);
    throw error;
  }
};