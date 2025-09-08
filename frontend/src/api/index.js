import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // In production (Vercel), use the environment variable or relative path
  if (import.meta.env.PROD) {
    // Use the VITE_API_URL if set, otherwise use relative path for Vercel routing
    return import.meta.env.VITE_API_URL || '/api';
  }
  
  // In development, use the environment variable or default to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
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

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const profile = localStorage.getItem('profile');
      if (profile) {
        localStorage.removeItem('profile');
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    return Promise.reject(error);
  }
);

export default api;