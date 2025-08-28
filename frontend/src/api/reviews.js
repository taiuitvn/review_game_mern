import API from './api';
import data from '../utils/mockData.json';

const apiKey = import.meta.env.VITE_RAWG_API_KEY;

// Mock API functions (đọc từ JSON)
export const fetchReviews = () => Promise.resolve({ data: data.reviews });
export const fetchTrendingReviews = () => Promise.resolve({ data: data.trendingReviews.slice(0, 5) });
export const createReview = (newReview) => Promise.resolve({ data: { ...newReview, _id: Date.now().toString() } });
export const getReviewById = (id) => {
  const review = data.reviews.find(r => r._id === id);
  return review ? Promise.resolve({ data: review }) : Promise.reject(new Error('Review not found'));
};
export const likeReview = (id) => Promise.resolve({ data: { success: true } });
export const saveReview = (id) => Promise.resolve({ data: { success: true } });
export const commentOnReview = (id, commentData) => {
  const newComment = {
    _id: Date.now().toString(),
    ...commentData,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    replies: []
  };
  return Promise.resolve({ data: newComment });
};

export const searchGames = (query) => {
  if (!query) return Promise.resolve({ data: { results: [] } });
  return API.get('/games', {
    params: {
      key: apiKey,
      search: query,
      page_size: 5 
    }
  });
};

