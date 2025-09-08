import { useState, useEffect } from 'react';
import { Post } from '../types';
import { getTrendingPosts } from '../api/reviews';

interface UseTrendingReturn {
  trendingPosts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTrending = (): UseTrendingReturn => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching trending posts...');
      const response = await getTrendingPosts();
      console.log('Trending posts response:', response);
      
      const postsData = Array.isArray(response) ? response : [];
      console.log('Processed trending posts:', postsData.length, 'posts');
      if (postsData.length > 0) {
        console.log('Sample trending post:', {
          id: postsData[0]._id,
          title: postsData[0].title,
          hasId: !!postsData[0]._id
        });
      }
      
      setTrendingPosts(postsData);
    } catch (err: any) {
      console.error('Error fetching trending posts:', err);
      setError(err.message || 'Failed to fetch trending posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return {
    trendingPosts,
    loading,
    error,
    refetch: fetchTrending
  };
};