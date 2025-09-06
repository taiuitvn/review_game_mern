import { useState } from 'react';
import { followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../api/users';

interface UseFollowsReturn {
  loading: boolean;
  error: string | null;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
}

export const useFollows = (): UseFollowsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);

  const followUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiFollowUser(userId);
      setFollowingList(prev => [...prev, userId]);
    } catch (err: any) {
      setError(err.message || 'Failed to follow user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiUnfollowUser(userId);
      setFollowingList(prev => prev.filter(id => id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to unfollow user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = (userId: string): boolean => {
    return followingList.includes(userId);
  };

  return {
    loading,
    error,
    followUser,
    unfollowUser,
    isFollowing
  };
};
