// User Types
export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  savedPosts?: string[];
  followers?: string[];
  following?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type DbUser = User;

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  success: boolean;
  user?: DbUser;
  error?: string;
}

// Post/Review Types
export interface Post {
  _id: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  views: number;
  authorId: string | User;
  likes: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export type Review = Post;

// Comment Types
export interface Comment {
  _id: string;
  postId: string;
  authorId: string | User;
  content: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
}

// Rating Types
export interface Rating {
  _id: string;
  postId: string;
  userId: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: string;
  postId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: string;
}