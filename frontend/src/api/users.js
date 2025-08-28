import API from './api';

export const getUserProfile = (userId) => API.get(`/users/${userId}`);

export const followUser = (userId) => API.post(`/users/${userId}/follow`);

export const unfollowUser = (userId) => API.delete(`/users/${userId}/follow`);