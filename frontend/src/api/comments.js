import api from './index';

// Comments API endpoints
export const getCommentsByPostId = (postId) => api.get(`/comments/post/${postId}`);
export const createComment = (commentData) => api.post('/comments', commentData);
export const editComment = (id, commentData) => api.put(`/comments/edit/${id}`, commentData);
export const deleteComment = (id) => api.delete(`/comments/remove/${id}`);
export const likeComment = (id) => api.post(`/comments/like/${id}`);