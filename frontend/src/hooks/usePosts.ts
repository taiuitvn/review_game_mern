import { useState, useEffect } from 'react';
import { Post, User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  getPostById: (postId: string) => Post | undefined;
  getPostsByAuthor: (authorId: string) => Post[];
  getSavedPosts: (userId: string) => Post[];
  getTrendingPosts: () => Post[];
  createPost: (postData: Omit<Post, '_id' | 'views' | 'likes' | 'savedBy' | 'createdAt' | 'updatedAt' | 'author'>) => Post;
  updatePost: (postId: string, updateData: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;
  isPostLiked: (postId: string, userId: string) => boolean;
  incrementViews: (postId: string) => void;
}

export const usePosts = (): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Populate posts with author info
        const postsWithAuthors = mockDB.posts.map(post => {
          const author = mockDB.users.find(user => user._id === post.authorId) as User;
          return {
            ...post,
            author: {
              id: author._id,
              name: author.username,
              avatar: author.avatarUrl,
              bio: author.bio
            }
          };
        });
        setPosts(postsWithAuthors);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
        setError(errorMessage);
        setLoading(false);
      }
    }, 500);
  }, []);

  const getPostById = (postId: string): Post | undefined => {
    return posts.find(post => post._id === postId);
  };

  const getPostsByAuthor = (authorId: string): Post[] => {
    return posts.filter(post => post.authorId === authorId);
  };

  const getSavedPosts = (userId: string): Post[] => {
    const user = mockDB.users.find(u => u._id === userId) as User;
    if (!user) return [];
    return posts.filter(post => user.savedPosts.includes(post._id));
  };

  const getTrendingPosts = (): Post[] => {
    // Sort by engagement (views + likes count)
    return [...posts].sort((a, b) => {
      const aEngagement = a.views + a.likes.length;
      const bEngagement = b.views + b.likes.length;
      return bEngagement - aEngagement;
    });
  };

  const createPost = (postData: Omit<Post, '_id' | 'views' | 'likes' | 'savedBy' | 'createdAt' | 'updatedAt' | 'author'>): Post => {
    const newPost: Post = {
      _id: `post_${Date.now()}`,
      ...postData,
      views: 0,
      likes: [],
      savedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: '',
        name: '',
        avatar: '',
        bio: ''
      }
    };
    
    const author = mockDB.users.find(user => user._id === postData.authorId) as User;
    const postWithAuthor: Post = {
      ...newPost,
      author: {
        id: author._id,
        name: author.username,
        avatar: author.avatarUrl,
        bio: author.bio
      }
    };
    
    setPosts(prev => [postWithAuthor, ...prev]);
    return postWithAuthor;
  };

  const updatePost = (postId: string, updateData: Partial<Post>): void => {
    setPosts(prev => prev.map(post => 
      post._id === postId 
        ? { ...post, ...updateData, updatedAt: new Date().toISOString() }
        : post
    ));
  };

  const deletePost = (postId: string): void => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const likePost = (postId: string, userId: string): void => {
    const post = getPostById(postId);
    if (post && !post.likes.includes(userId)) {
      updatePost(postId, {
        likes: [...post.likes, userId]
      });
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
