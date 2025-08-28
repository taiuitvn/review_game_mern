import { useState, useEffect } from 'react';
import { Follow, User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UseFollowsReturn {
  follows: Follow[];
  loading: boolean;
  error: string | null;
  getFollowers: (userId: string) => Follow['follower'][];
  getFollowing: (userId: string) => Follow['following'][];
  getFollowerCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  isFollowing: (followerId: string, followingId: string) => boolean;
  followUser: (followerId: string, followingId: string) => Follow | undefined;
  unfollowUser: (followerId: string, followingId: string) => void;
  getMutualFollows: (userId1: string, userId2: string) => User[];
  getSuggestedUsers: (userId: string, limit?: number) => (User & { followerCount: number })[];
}

export const useFollows = (): UseFollowsReturn => {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Populate follows with user info
        const followsWithUsers = mockDB.follows.map(follow => {
          const follower = mockDB.users.find(user => user._id === follow.followerId) as User;
          const following = mockDB.users.find(user => user._id === follow.followingId) as User;
          
          return {
            ...follow,
            follower: follower ? {
              id: follower._id,
              name: follower.username,
              avatar: follower.avatarUrl,
              bio: follower.bio
            } : undefined,
            following: following ? {
              id: following._id,
              name: following.username,
              avatar: following.avatarUrl,
              bio: following.bio
            } : undefined
          };
        });

        setFollows(followsWithUsers);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load follows';
        setError(errorMessage);
        setLoading(false);
      }
    }, 300);
  }, []);

  const getFollowers = (userId: string): Follow['follower'][] => {
    return follows
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.follower)
      .filter((follower): follower is NonNullable<Follow['follower']> => Boolean(follower));
  };

  const getFollowing = (userId: string): Follow['following'][] => {
    return follows
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.following)
      .filter((following): following is NonNullable<Follow['following']> => Boolean(following));
  };

  const getFollowerCount = (userId: string): number => {
    return follows.filter(follow => follow.followingId === userId).length;
  };

  const getFollowingCount = (userId: string): number => {
    return follows.filter(follow => follow.followerId === userId).length;
  };

  const isFollowing = (followerId: string, followingId: string): boolean => {
    return follows.some(follow => 
      follow.followerId === followerId && follow.followingId === followingId
    );
  };

  const followUser = (followerId: string, followingId: string): Follow | undefined => {
    // Check if already following
    if (isFollowing(followerId, followingId)) {
      return undefined;
    }

    const newFollow: Follow = {
      _id: `follow_${Date.now()}`,
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };

    const follower = mockDB.users.find(user => user._id === followerId) as User;
    const following = mockDB.users.find(user => user._id === followingId) as User;

    const followWithUsers: Follow = {
      ...newFollow,
      follower: follower ? {
        id: follower._id,
        name: follower.username,
        avatar: follower.avatarUrl,
        bio: follower.bio
      } : undefined,
      following: following ? {
        id: following._id,
        name: following.username,
        avatar: following.avatarUrl,
        bio: following.bio
      } : undefined
    };

    setFollows(prev => [...prev, followWithUsers]);
    return followWithUsers;
  };

  const unfollowUser = (followerId: string, followingId: string): void => {
    setFollows(prev => prev.filter(follow => 
      !(follow.followerId === followerId && follow.followingId === followingId)
    ));
  };

  const getMutualFollows = (userId1: string, userId2: string): User[] => {
    const user1Following = getFollowing(userId1).map(u => u?.id).filter(Boolean) as string[];
    const user2Following = getFollowing(userId2).map(u => u?.id).filter(Boolean) as string[];
    
    const mutualIds = user1Following.filter(id => user2Following.includes(id));
    return mutualIds.map(id => mockDB.users.find(u => u._id === id) as User).filter(Boolean);
  };

  const getSuggestedUsers = (userId: string, limit: number = 5): (User & { followerCount: number })[] => {
    const userFollowing = getFollowing(userId).map(u => u?.id).filter(Boolean) as string[];
    const allUsers = mockDB.users.filter(u => u._id !== userId && !userFollowing.includes(u._id));
    
    // Simple suggestion algorithm: users with most followers
    return allUsers
      .map(user => ({
        ...user,
        followerCount: getFollowerCount(user._id)
      }))
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, limit);
  };

  return {
    follows,
    loading,
    error,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    isFollowing,
    followUser,
    unfollowUser,
    getMutualFollows,
    getSuggestedUsers
  };
};
