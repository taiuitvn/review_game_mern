import api from './index';

// Rate a post
export const ratePost = async (postId, rating) => {
  try {
    const response = await api.post(`/rating/${postId}/rate`, {
      value: rating
    });
    return response.data;
  } catch (error) {
    console.error('Error rating post:', error);
    throw error;
  }
};

// Get post with ratings
export const getPostRatings = async (postId) => {
  try {
    const response = await api.get(`/rating/${postId}/ratings`);
    return response.data;
  } catch (error) {
    console.error('Error getting post ratings:', error);
    throw error;
  }
};

// Delete user's rating for a post
export const deleteRating = async (postId) => {
  try {
    const response = await api.delete(`/rating/remove/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
};

// Get current user's rating for a post
export const getUserRatingForPost = async (postId) => {
  try {
    const response = await api.get(`/rating/${postId}/me`);
    return response.data;
  } catch (error) {
    console.error('Error getting user rating:', error);
    throw error;
  }
};