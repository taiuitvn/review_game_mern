import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as DbUser, LoginCredentials, RegisterData, AuthResult } from '../types';
import { login as apiLogin, register as apiRegister, updateUser } from '../api/auth';
import { savePost as apiSavePost } from '../api/reviews';
import { followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../api/users';

interface AuthContextType {
  user: DbUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updateData: Partial<DbUser>) => Promise<AuthResult>;
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;
  isFollowing: (targetUserId: string) => boolean;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
  saveReview: (reviewId: string) => Promise<void>;
  unsaveReview: (reviewId: string) => Promise<void>;
  isReviewSaved: (reviewId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // const { followUser: followUserInDB, unfollowUser: unfollowUserInDB, isFollowing } = useFollows(); // Removed to avoid potential issues

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.token && profile.user) {
          setUser(profile.user);
        }
      } catch (error) {
        console.error('Error parsing stored profile:', error);
        localStorage.removeItem('profile');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response = await apiLogin(credentials);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('profile', JSON.stringify({ token, user }));
      setUser(user as DbUser);
      navigate('/');
      return { success: true, user: user as DbUser };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response: any = await apiRegister(userData);
      let token: string | undefined;
      let user: DbUser | undefined;
      if (response?.data?.token && response?.data?.user) {
        token = response.data.token;
        user = response.data.user;
      } else if (response?.data?._id || response?.data?.username) {
        // Backend trả về user thuần sau khi đăng ký -> tự động đăng nhập
        const loginResp: any = await apiLogin({ email: (userData as any).email, password: (userData as any).password });
        token = loginResp?.data?.token;
        user = loginResp?.data?.user;
      }

      if (token && user) {
        localStorage.setItem('profile', JSON.stringify({ token, user }));
        setUser(user as DbUser);
        navigate('/');
        return { success: true, user } as AuthResult;
      }
      return { success: false, error: 'Registration succeeded but login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('profile');
    setUser(null);
    navigate('/');
  };

  const updateProfile = async (updateData: Partial<DbUser>): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response: any = await updateUser(user._id, updateData);
      const updatedUser = response.data.user;
      
      // Update stored profile
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.user = updatedUser;
        localStorage.setItem('profile', JSON.stringify(profile));
      }
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  const followUser = async (targetUserId: string): Promise<void> => {
    if (!user || !targetUserId) return;
    try {
      await apiFollowUser(targetUserId);
      const followingArr: string[] = Array.isArray((user as any).following) ? (user as any).following : [];
      const updatedFollowing = followingArr.includes(targetUserId) ? followingArr : [...followingArr, targetUserId];

      const updatedUser: DbUser = { ...(user as any), following: updatedFollowing } as any;
      setUser(updatedUser);

      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.user = updatedUser;
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
      throw error;
    }
  };

  const unfollowUser = async (targetUserId: string): Promise<void> => {
    if (!user || !targetUserId) return;
    try {
      await apiUnfollowUser(targetUserId);
      const followingArr: string[] = Array.isArray((user as any).following) ? (user as any).following : [];
      const updatedFollowing = followingArr.filter((id: string) => id !== targetUserId);

      const updatedUser: DbUser = { ...(user as any), following: updatedFollowing } as any;
      setUser(updatedUser);

      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.user = updatedUser;
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      throw error;
    }
  };

  const isFollowing = (targetUserId: string): boolean => {
    if (!user || !targetUserId) return false;
    const followingIds: string[] = Array.isArray((user as any).following) ? (user as any).following : [];
    return followingIds.includes(targetUserId);
  };

  const savePost = async (postId: string): Promise<void> => {
    if (!user) return;
    
    try {
      await apiSavePost(postId);
      
      // Check if the post is now saved or unsaved based on response or current state
      const isCurrentlySaved = (user.savedPosts || []).includes(postId);
      const updatedSavedPosts = isCurrentlySaved 
        ? ((user as any).savedPosts || []).filter((id: string) => id !== postId)
        : [...(((user as any).savedPosts || []) as string[]), postId];
      
      const updatedUser: DbUser = {
        ...user,
        savedPosts: updatedSavedPosts as any
      };
      
      setUser(updatedUser);
      
      // Update stored profile
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.user = updatedUser;
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      throw error;
    }
  };

  const unsavePost = async (postId: string): Promise<void> => {
    // Since the API toggles save/unsave, we can reuse the savePost logic
    await savePost(postId);
  };

  const isPostSaved = (postId: string): boolean => {
    if (!user) return false;
    return (user.savedPosts || []).includes(postId);
  };

  // Review functions (alias for post functions)
  const saveReview = async (reviewId: string): Promise<void> => {
    await savePost(reviewId);
  };

  const unsaveReview = async (reviewId: string): Promise<void> => {
    await unsavePost(reviewId);
  };

  const isReviewSaved = (reviewId: string): boolean => {
    return isPostSaved(reviewId);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    followUser,
    unfollowUser,
    isFollowing,
    savePost,
    unsavePost,
    isPostSaved,
    saveReview,
    unsaveReview,
    isReviewSaved
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
