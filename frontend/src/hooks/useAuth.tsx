import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as DbUser, LoginCredentials, RegisterData, AuthResult } from '../types';
import { login as apiLogin, register as apiRegister, updateUser } from '../api/auth';
import { savePost as apiSavePost, likePost as apiLikePost } from '../api/reviews';
import { followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../api/users';

interface AuthContextType {
  user: DbUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updateData: Partial<DbUser>) => Promise<AuthResult>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  isFollowing: (targetUserId: string) => boolean;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
  likePost: (postId: string) => Promise<void>;
  isPostLiked: (postId: string) => boolean;
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
      // Don't navigate here to avoid conflicts with form submission handling
      return { success: true, user: user as DbUser };
    } catch (error: any) {
      // Provide user-friendly error messages
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 401) {
        // Handle specific 401 errors from backend
        const backendMessage = error.response?.data?.msg || error.response?.data?.message;
        if (backendMessage === "Invalid credentials" || backendMessage === "Wrong password") {
          errorMessage = "Tài khoản hoặc mật khẩu không chính xác";
        } else {
          errorMessage = backendMessage || errorMessage;
        }
      } else if (error.response?.status === 400) {
        // Handle 400 errors (missing email/password)
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
      
      // Check if response contains token and user directly
      if (response?.data?.token && response?.data?.user) {
        token = response.data.token;
        user = response.data.user;
      }
      // If not, try to login with the provided credentials
      else {
        try {
          const loginResp: any = await apiLogin({ 
            email: userData.email, 
            password: userData.password 
          });
          token = loginResp?.data?.token;
          user = loginResp?.data?.user;
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          return { success: false, error: 'Registration succeeded but auto-login failed' };
        }
      }

      if (token && user) {
        localStorage.setItem('profile', JSON.stringify({ token, user }));
        setUser(user as DbUser);
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
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const updateProfile = async (updateData: Partial<DbUser>): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response: any = await updateUser(user._id, updateData);
      const updatedUser = response.user;
      
      // Update stored profile
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        profile.user = updatedUser;
        localStorage.setItem('profile', JSON.stringify(profile));
      }
      
      // Update user state
      setUser(updatedUser as DbUser);
      
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
      
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
      const response = await apiSavePost(postId);
      
      // Use the updated savedPosts array from server response
      let updatedSavedPosts: string[] = [];
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          // Direct array response
          updatedSavedPosts = response;
        } else if (response.hasOwnProperty('savedPosts')) {
          // Object with savedPosts property
          updatedSavedPosts = Array.isArray(response.savedPosts) ? response.savedPosts : [];
        } else if (response.hasOwnProperty('userSavedPosts')) {
          // Object with userSavedPosts property
          updatedSavedPosts = Array.isArray(response.userSavedPosts) ? response.userSavedPosts : [];
        } else if (response.hasOwnProperty('data') && response.data.hasOwnProperty('savedPosts')) {
          // Nested data object with savedPosts property
          updatedSavedPosts = Array.isArray(response.data.savedPosts) ? response.data.savedPosts : [];
        }
      }
      
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

  // Like functionality
  const likePost = async (postId: string): Promise<any> => {
    if (!user) return;
    
    try {
      const response = await apiLikePost(postId);
      console.log('Like post response:', response);
  
      return response;
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  };

  const isPostLiked = (postId: string): boolean => {
    return false;
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
    likePost,
    isPostLiked
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