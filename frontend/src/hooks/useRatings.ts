import { useState, useEffect } from 'react';
import { Rating, User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UseRatingsReturn {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  getRatingById: (ratingId: string) => Rating | undefined;
  getUserRatingForPost: (userId: string, postId: string) => Rating | undefined;
  getAverageRating: (postId: string) => number;
  getRatingCount: (postId: string) => number;
  getRatingDistribution: (postId: string) => Record<number, number>;
  addRating: (ratingData: Omit<Rating, '_id' | 'createdAt' | 'updatedAt' | 'user'>) => Rating;
  updateRating: (ratingId: string, updateData: Partial<Rating>) => void;
  upsertRating: (userId: string, postId: string, ratingData: Omit<Rating, '_id' | 'userId' | 'postId' | 'createdAt' | 'updatedAt' | 'user'>) => Rating;
  deleteRating: (ratingId: string) => void;
  hasUserRated: (userId: string, postId: string) => boolean;
}

export const useRatings = (postId?: string): UseRatingsReturn => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        let filteredRatings = mockDB.ratings;
        
        // Filter by postId if provided
        if (postId) {
          filteredRatings = mockDB.ratings.filter(rating => rating.postId === postId);
        }

        // Populate ratings with user info
        const ratingsWithUsers = filteredRatings.map(rating => {
          const user = mockDB.users.find(u => u._id === rating.userId) as User;
          return {
            ...rating,
            user: user ? {
              id: user._id,
              name: user.username,
              avatar: user.avatarUrl
            } : undefined
          };
        });

        setRatings(ratingsWithUsers);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load ratings';
        setError(errorMessage);
        setLoading(false);
      }
    }, 300);
  }, [postId]);

  const getRatingById = (ratingId: string): Rating | undefined => {
    return ratings.find(rating => rating._id === ratingId);
  };

  const getUserRatingForPost = (userId: string, postId: string): Rating | undefined => {
    return ratings.find(rating => rating.userId === userId && rating.postId === postId);
  };

  const getAverageRating = (postId: string): number => {
    const postRatings = ratings.filter(rating => rating.postId === postId);
    if (postRatings.length === 0) return 0;
    
    const sum = postRatings.reduce((acc, rating) => acc + rating.score, 0);
    return Math.round((sum / postRatings.length) * 10) / 10; // Round to 1 decimal place
  };

  const getRatingCount = (postId: string): number => {
    return ratings.filter(rating => rating.postId === postId).length;
  };

  const getRatingDistribution = (postId: string): Record<number, number> => {
    const postRatings = ratings.filter(rating => rating.postId === postId);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    
    postRatings.forEach(rating => {
      distribution[rating.score] = (distribution[rating.score] || 0) + 1;
    });
    
    return distribution;
  };

  const addRating = (ratingData: Omit<Rating, '_id' | 'createdAt' | 'updatedAt' | 'user'>): Rating => {
    const newRating: Rating = {
      _id: `rating_${Date.now()}`,
      ...ratingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const user = mockDB.users.find(u => u._id === ratingData.userId) as User;
    const ratingWithUser: Rating = {
      ...newRating,
      user: user ? {
        id: user._id,
        name: user.username,
        avatar: user.avatarUrl
      } : undefined
    };

    setRatings(prev => [...prev, ratingWithUser]);
    return ratingWithUser;
  };

  const updateRating = (ratingId: string, updateData: Partial<Rating>): void => {
    setRatings(prev => prev.map(rating => 
      rating._id === ratingId 
        ? { ...rating, ...updateData, updatedAt: new Date().toISOString() }
        : rating
    ));
  };

  const upsertRating = (userId: string, postId: string, ratingData: Omit<Rating, '_id' | 'userId' | 'postId' | 'createdAt' | 'updatedAt' | 'user'>): Rating => {
    const existingRating = getUserRatingForPost(userId, postId);
    
    if (existingRating) {
      // Update existing rating
      updateRating(existingRating._id, ratingData);
      return { ...existingRating, ...ratingData };
    } else {
      // Create new rating
      return addRating({ ...ratingData, userId, postId });
    }
  };

  const deleteRating = (ratingId: string): void => {
    setRatings(prev => prev.filter(rating => rating._id !== ratingId));
  };

  const hasUserRated = (userId: string, postId: string): boolean => {
    return !!getUserRatingForPost(userId, postId);
  };

  return {
    ratings,
    loading,
    error,
    getRatingById,
    getUserRatingForPost,
    getAverageRating,
    getRatingCount,
    getRatingDistribution,
    addRating,
    updateRating,
    upsertRating,
    deleteRating,
    hasUserRated
  };
};
