import { useState, useEffect } from 'react';
import { Post } from '../types';
import { getAllPosts, getPostById as apiGetPostById, createPost as apiCreatePost, updatePost as apiUpdatePost, deletePost as apiDeletePost, likePost as apiLikePost } from '../api/reviews';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  getPostById: (postId: string) => Post | undefined;
  getPostsByAuthor: (authorId: string) => Post[];
  getSavedPosts: () => Post[];
  getTrendingPosts: () => Post[];
  createPost: (postData: Partial<Post>) => Promise<Post>;
  updatePost: (postId: string, updateData: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => void;
  isPostLiked: (postId: string, userId: string) => boolean;
  incrementViews: (postId: string) => void;
}

export const usePosts = (): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        const response: any = await getAllPosts();
        console.log('Posts response:', response);
        
        // Handle different response formats from backend
        let postsData: Post[] = [];
        
        if (Array.isArray(response)) {
          postsData = response;
        } else if (Array.isArray(response?.data)) {
          postsData = response.data;
        } else if (Array.isArray(response?.data?.posts)) {
          postsData = response.data.posts;
        } else if (response?.posts && Array.isArray(response.posts)) {
          postsData = response.posts;
        }
        
        console.log('Processed posts data:', postsData);
        setPosts(postsData);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load posts';
        console.error('Error fetching posts:', err);
        setError(errorMessage);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getPostById = (postId: string): Post | undefined => {
    return posts.find(post => post._id === postId);
  };

  const getPostsByAuthor = (authorId: string): Post[] => {
    return posts.filter(post => {
      const aid = (post.authorId && typeof post.authorId === 'object') ? (post.authorId as any)._id : post.authorId;
      return aid === authorId;
    });
  };

  const getSavedPosts = (): Post[] => {
    // This will be handled by the API in the future
    // For now, return empty array as this should be called from useAuth
    return [];
  };

  const getTrendingPosts = (): Post[] => {
    // Sort by engagement (views + likes count)
    return [...posts].sort((a, b) => {
      const aEngagement = a.views + a.likes.length;
      const bEngagement = b.views + b.likes.length;
      return bEngagement - aEngagement;
    });
  };

  const createPost = async (postData: Partial<Post>): Promise<Post> => {
    try {
      const response: any = await apiCreatePost(postData as any);
      const newPost: Post = response.data;
      setPosts((prev: Post[]) => [newPost, ...prev]);
      return newPost;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
      setError(errorMessage);
      throw error;
    }
  };

  const updatePost = async (postId: string, updateData: Partial<Post>): Promise<void> => {
    try {
      const response: any = await apiUpdatePost(postId, updateData);
      const updatedPost: Post = response.data;
      setPosts((prev: Post[]) => prev.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update post';
      setError(errorMessage);
      throw error;
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    try {
      await apiDeletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete post';
      setError(errorMessage);
      throw error;
    }
  };

  const likePost = async (postId: string): Promise<void> => {
    try {
      await apiLikePost(postId);
      // Refresh the post data after liking
      const response: any = await apiGetPostById(postId);
      const updatedPost: Post = response.data;
      setPosts((prev: Post[]) => prev.map(post => 
        post._id === postId ? updatedPost : post
      ));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to like post';
      setError(errorMessage);
      throw error;
    }
  };

  const unlikePost = (postId: string, userId: string): void => {
    const post = getPostById(postId);
    if (post) {
      updatePost(postId, {
        likes: post.likes.filter(id => id !== userId)
      });
    }
  };

  const isPostLiked = (postId: string, userId: string): boolean => {
    const post = getPostById(postId);
    return post ? post.likes.includes(userId) : false;
  };

  const incrementViews = (postId: string): void => {
    const post = getPostById(postId);
    if (post) {
      updatePost(postId, {
        views: post.views + 1
      });
    }
  };

  return {
    posts,
    loading,
    error,
    getPostById,
    getPostsByAuthor,
    getSavedPosts,
    getTrendingPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    isPostLiked,
    incrementViews
  };
};

interface UsePostReturn {
  post: Post | undefined;
  loading: boolean;
  error: string | null;
  updatePost: (updateData: Partial<Post>) => void;
}

export const usePost = (postId: string): UsePostReturn => {
  const { loading, error, getPostById, updatePost, incrementViews } = usePosts();
  const post = getPostById(postId);

  useEffect(() => {
    if (post && postId) {
      incrementViews(postId);
    }
  }, [postId, post, incrementViews]);

  return {
    post,
    loading,
    error,
    updatePost: (updateData: Partial<Post>) => updatePost(postId, updateData)
  };
};
