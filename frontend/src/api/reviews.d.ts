import { Post, Comment } from '../types';

export function getAllPosts(page?: number, limit?: number): Promise<{ posts: Post[], totalPages: number, currentPage: number, totalPosts: number }>;
export function getPostById(postId: string): Promise<Post>;
export function createPost(postData: Partial<Post>): Promise<Post>;
export function likePost(postId: string): Promise<any>;
export function savePost(postId: string): Promise<any>;
export function getSavedPosts(): Promise<Post[]>;
export function getTrendingPosts(): Promise<Post[]>;
export function searchPosts(query: string): Promise<Post[]>;
export function searchPostsAdvanced(filters: any): Promise<Post[]>;
export function getCommentsByPostId(postId: string): Promise<Comment[]>;
export function commentOnReview(postId: string, content: string): Promise<Comment>;
export function replyToComment(postId: string, parentCommentId: string, content: string): Promise<Comment>;
export function likeComment(commentId: string): Promise<any>;
export function dislikeComment(commentId: string): Promise<any>;
export function deleteComment(commentId: string): Promise<any>;
export function updateComment(commentId: string, content: string): Promise<Comment>;
export function updatePost(postId: string, postData: Partial<Post>): Promise<Post>;
export function deletePost(postId: string): Promise<any>;
export function incrementPostViews(postId: string): Promise<any>;
export function getPostsByGenre(genre: string): Promise<Post[]>;
export function getPostsByPlatform(platform: string): Promise<Post[]>;
export function getAllGenres(): Promise<string[]>;
export function getAllPlatforms(): Promise<string[]>;

// Alias functions
export function updateReview(postId: string, updateData: Partial<Post>): Promise<Post>;
export function deleteReview(postId: string): Promise<any>;
export function getAllReviews(page?: number, limit?: number): Promise<{ posts: Post[], totalPages: number, currentPage: number, totalPosts: number }>;
export function getReviewById(postId: string): Promise<Post>;
export function createReview(postData: Partial<Post>): Promise<Post>;
export function likeReview(postId: string): Promise<any>;
export function saveReview(postId: string): Promise<any>;
export function getSavedReviews(): Promise<Post[]>;
export function getTrendingReviews(limit?: number): Promise<Post[]>;
export function searchReviews(title: string): Promise<Post[]>;
export function searchPostsByTitle(title: string): Promise<Post[]>;
export function fetchReviews(page?: number, limit?: number): Promise<{ posts: Post[], totalPages: number, currentPage: number, totalPosts: number }>;