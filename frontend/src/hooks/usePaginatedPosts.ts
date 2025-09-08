import { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';
import { getAllPosts } from '../api/reviews';

interface UsePaginatedPostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

interface UsePaginatedPostsParams {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const usePaginatedPosts = ({
  initialPage = 1,
  limit = 10,
  autoFetch = true
}: UsePaginatedPostsParams = {}): UsePaginatedPostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching posts for page ${page} with limit ${limit}...`);
      
      const response: any = await getAllPosts(page, limit);
      console.log('Paginated posts response:', response);
      
      // Handle different response formats from backend
      let postsData: Post[] = [];
      let totalPostsCount = 0;
      let totalPagesCount = 0;
      
      if (response?.posts && Array.isArray(response.posts)) {
        // Backend returns { posts, totalPosts, totalPages, currentPage }
        postsData = response.posts;
        totalPostsCount = response.totalPosts || 0;
        totalPagesCount = response.totalPages || 0;
      } else if (Array.isArray(response?.data?.posts)) {
        postsData = response.data.posts;
        totalPostsCount = response.data.totalPosts || 0;
        totalPagesCount = response.data.totalPages || 0;
      } else if (Array.isArray(response)) {
        // Fallback for simple array response
        postsData = response;
        totalPostsCount = response.length;
        totalPagesCount = 1;
      }
      
      console.log('Processed paginated posts data:', {
        postsCount: postsData.length,
        totalPosts: totalPostsCount,
        totalPages: totalPagesCount,
        currentPage: page
      });
      
      setPosts(postsData);
      setTotalPosts(totalPostsCount);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load posts';
      console.error('Error fetching paginated posts:', err);
      setError(errorMessage);
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const setPage = useCallback((page: number) => {
    console.log('usePaginatedPosts setPage called with:', page, typeof page);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log('Fetching posts for page:', page);
      fetchPosts(page);
    }
  }, [currentPage, totalPages, fetchPosts]);

  const refetch = useCallback(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

  useEffect(() => {
    if (autoFetch) {
      fetchPosts(initialPage);
    }
  }, [fetchPosts, initialPage, autoFetch]);

  // Reset currentPage to 1 if it exceeds totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log(`Resetting currentPage from ${currentPage} to 1 because totalPages is ${totalPages}`);
      fetchPosts(1);
    }
  }, [totalPages, currentPage, fetchPosts]);

  return {
    posts,
    loading,
    error,
    currentPage,
    totalPages,
    totalPosts,
    setPage,
    refetch
  };
};

export default usePaginatedPosts;