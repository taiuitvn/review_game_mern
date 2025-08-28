// Database entity types based on MongoDB schema

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  bio: string;
  savedPosts: string[];
  createdAt: string;
  updatedAt: string;
  // Backward compatibility
  id?: string;
}

export interface Post {
  _id: string;
  authorId: string;
  title: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
  rating: number;
  views: number;
  likes: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
  // Populated fields
  author: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
}

export interface Comment {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  // Populated fields
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Notification {
  _id: string;
  recipientId: string;
  senderId: string;
  type: 'comment' | 'like' | 'likeComment';
  postId?: string | null;
  commentId?: string | null;
  isRead: boolean;
  createdAt: string;
  // Populated fields
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  post?: {
    id: string;
    title: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

export interface Rating {
  _id: string;
  postId: string;
  userId: string;
  score: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Follow {
  _id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  // Populated fields
  follower?: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  following?: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Hook return types
export interface HookState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}
