import { useState, useEffect } from 'react';
import { User } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  getUserById: (userId: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  updateUser: (userId: string, updateData: Partial<User>) => void;
  savePost: (userId: string, postId: string) => void;
  unsavePost: (userId: string, postId: string) => void;
  isPostSaved: (userId: string, postId: string) => boolean;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setUsers(mockDB.users as User[]);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
        setError(errorMessage);
        setLoading(false);
      }
    }, 500);
  }, []);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user._id === userId);
  };

  const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email === email);
  };

  const updateUser = (userId: string, updateData: Partial<User>): void => {
    setUsers(prev => prev.map(user => 
      user._id === userId 
        ? { ...user, ...updateData, updatedAt: new Date().toISOString() }
        : user
    ));
  };

  const savePost = (userId: string, postId: string): void => {
    const user = getUserById(userId);
    if (user && !user.savedPosts.includes(postId)) {
      updateUser(userId, {
        savedPosts: [...user.savedPosts, postId]
      });
    }
  };

  const unsavePost = (userId: string, postId: string): void => {
    const user = getUserById(userId);
    if (user) {
      updateUser(userId, {
        savedPosts: user.savedPosts.filter(id => id !== postId)
      });
    }
  };

  const isPostSaved = (userId: string, postId: string): boolean => {
    const user = getUserById(userId);
    return user ? user.savedPosts.includes(postId) : false;
  };

  return {
    users,
    loading,
    error,
    getUserById,
    getUserByEmail,
    updateUser,
    savePost,
    unsavePost,
    isPostSaved
  };
};

interface UseUserReturn {
  user: User | undefined;
  loading: boolean;
  error: string | null;
  updateUser: (updateData: Partial<User>) => void;
}

export const useUser = (userId: string): UseUserReturn => {
  const { loading, error, getUserById, updateUser } = useUsers();
  const user = getUserById(userId);

  return {
    user,
    loading,
    error,
    updateUser: (updateData: Partial<User>) => updateUser(userId, updateData)
  };
};
