// Auth API functions
import api from './index';

export const login = async (credentials) => {
  try {
    console.log('Auth API - login called with:', credentials);
    const { email, password } = credentials;
    console.log('Auth API - destructured:', { email, password });
    const response = await api.post('/auth/login', { email, password });
    console.log('Auth API - login response:', response);
    console.log('Auth API - response.data:', response.data);
    return response; // Return full response for axios data handling
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('Auth API - register called with:', userData);
    const { username, email, password } = userData;
    console.log('Auth API - destructured:', { username, email, password });
    const response = await api.post('/auth/register', { username, email, password });
    console.log('Auth API - register response:', response);
    return response; // Return full response for axios data handling
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

// Password reset functions
export const forgotPassword = async (email) => {
  try {
    console.log('Auth API - forgotPassword called with:', email);
    const response = await api.post('/auth/forgot-password', { email });
    console.log('Auth API - forgotPassword response:', response);
    return response;
  } catch (error) {
    console.error('Forgot password API error:', error);
    throw error;
  }
};

export const resetPassword = async (token, password, confirmPassword) => {
  try {
    console.log('Auth API - resetPassword called with token:', token);
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
      confirmPassword
    });
    console.log('Auth API - resetPassword response:', response);
    return response;
  } catch (error) {
    console.error('Reset password API error:', error);
    throw error;
  }
};

export const validateResetToken = async (token) => {
  try {
    console.log('Auth API - validateResetToken called with:', token);
    const response = await api.get(`/auth/validate-reset-token/${token}`);
    console.log('Auth API - validateResetToken response:', response);
    return response;
  } catch (error) {
    console.error('Validate reset token API error:', error);
    throw error;
  }
};