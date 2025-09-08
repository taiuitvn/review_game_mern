declare module '../api/auth' {
  export interface LoginData {
    email: string;
    password: string;
  }

  export interface RegisterData {
    username: string;
    email: string;
    password: string;
  }

  export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    followers: string[];
    following: string[];
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateProfileData {
    username?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
  }

  export interface ForgotPasswordData {
    email: string;
  }

  export interface ResetPasswordData {
    token: string;
    password: string;
  }

  export function login(loginData: LoginData): Promise<{ data: { token: string; user: UserProfile } }>;
  export function register(registerData: RegisterData): Promise<{ data: { token: string; user: UserProfile } }>;
  export function getMyProfile(): Promise<{ data: UserProfile }>;
  export function updateProfile(profileData: UpdateProfileData): Promise<{ data: UserProfile }>;
  export function updateUser(userId: string, updates: UpdateProfileData): Promise<{ data: UserProfile }>;
  export function forgotPassword(email: string): Promise<{ data: { message: string } }>;
  export function resetPassword(token: string, password: string, confirmPassword: string): Promise<{ data: { message: string } }>;
  export function validateResetToken(token: string): Promise<{ data: { valid: boolean } }>;
}

declare module '../api/users' {
  export interface User {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    followers: string[];
    following: string[];
    createdAt: string;
    updatedAt: string;
  }

  export interface UserStats {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  }

  export interface Post {
    _id: string;
    title: string;
    content: string;
    author: User;
    createdAt: string;
    updatedAt: string;
    likes: string[];
    comments: string[];
    views: number;
  }

  export interface UpdateUserData {
    username?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
  }

  export function getUserById(userId: string): Promise<{ data: User }>;
  export function getUserPosts(userId: string, page?: number, limit?: number): Promise<{ data: { posts: Post[]; totalPages: number; currentPage: number } }>;
  export function followUser(userId: string): Promise<{ data: { message: string } }>;
  export function unfollowUser(userId: string): Promise<{ data: { message: string } }>;
  export function getUserStats(userId: string): Promise<{ data: UserStats }>;
  export function updateUser(userId: string, updateData: UpdateUserData): Promise<{ data: User }>;
  export function searchUsers(query: string): Promise<{ data: User[] }>;
  export function getFollowers(userId: string): Promise<{ data: User[] }>;
  export function getFollowing(userId: string): Promise<{ data: User[] }>;
}

declare module '../api/reviews' {
  export interface User {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    followers: string[];
    following: string[];
    createdAt: string;
    updatedAt: string;
  }

  export interface Comment {
    _id: string;
    content: string;
    author: User;
    createdAt: string;
    updatedAt: string;
    likes: string[];
    replies: Comment[];
  }

  export interface Post {
    _id: string;
    title: string;
    content: string;
    author: User;
    createdAt: string;
    updatedAt: string;
    likes: string[];
    comments: Comment[];
    views: number;
    rating?: number;
    gameTitle?: string;
    platform?: string;
    genre?: string;
    imageUrl?: string;
  }

  export interface CreatePostData {
    title: string;
    content: string;
    rating?: number;
    gameTitle?: string;
    platform?: string;
    genre?: string;
    imageUrl?: string;
  }

  export interface UpdatePostData {
    title?: string;
    content?: string;
    rating?: number;
    gameTitle?: string;
    platform?: string;
    genre?: string;
    imageUrl?: string;
  }

  export interface SearchFilters {
    genre?: string;
    platform?: string;
    rating?: number;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'views';
  }

  export function getAllPosts(page?: number, limit?: number): Promise<{ data: { posts: Post[]; totalPages: number; currentPage: number } }>;
  export function getPostById(postId: string): Promise<{ data: Post }>;
  export function createPost(postData: CreatePostData): Promise<{ data: Post }>;
  export function updatePost(postId: string, updateData: UpdatePostData): Promise<{ data: Post }>;
  export function deletePost(postId: string): Promise<{ data: { message: string } }>;
  export function likePost(postId: string): Promise<{ data: { message: string } }>;
  export function searchPostsByTitle(query: string): Promise<{ data: Post[] }>;
  export function searchPostsAdvanced(filters: SearchFilters): Promise<{ data: Post[] }>;
  export function getTrendingPosts(): Promise<{ data: Post[] }>;
  export function getReviewById(reviewId: string): Promise<{ data: Post }>;
  export function updateReview(reviewId: string, updateData: UpdatePostData): Promise<{ data: Post }>;
  export function deleteReview(reviewId: string): Promise<{ data: { message: string } }>;
  export function commentOnReview(reviewId: string, content: string): Promise<{ data: Comment }>;
  export function likeReview(reviewId: string): Promise<{ data: { message: string } }>;
  export function deleteComment(commentId: string): Promise<{ data: { message: string } }>;
  export function incrementPostViews(postId: string): Promise<{ data: { message: string } }>;
  export function replyToComment(commentId: string, content: string): Promise<{ data: Comment }>;
  export function getCommentsByPostId(postId: string): Promise<{ data: Comment[] }>;
  export function savePost(postId: string): Promise<{ data: { message: string } }>;
  export function likeComment(commentId: string): Promise<{ data: { message: string } }>;
  export function dislikeComment(commentId: string): Promise<{ data: { message: string } }>;
  export function updateComment(commentId: string, content: string): Promise<{ data: Comment }>;
}