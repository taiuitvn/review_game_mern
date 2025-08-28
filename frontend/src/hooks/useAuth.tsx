import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, RegisterData, AuthResult } from '../types';
import mockDB from '../utils/mockDatabase.json';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updateData: Partial<User>) => Promise<AuthResult>;
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;
  isFollowing: (targetUserId: string) => boolean;
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  saveReview: (reviewId: string) => void;
  unsaveReview: (reviewId: string) => void;
  isReviewSaved: (reviewId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // const { followUser: followUserInDB, unfollowUser: unfollowUserInDB, isFollowing } = useFollows(); // Removed to avoid potential issues

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;
        // Find full user data from mock database
        const fullUser = mockDB.users.find(u => u._id === userData._id || u._id === userData.id);
        if (fullUser) {
          setUser({
            ...fullUser,
            id: fullUser._id // For backward compatibility
          });
        } else {
          // Fallback to stored user data
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email
      const foundUser = mockDB.users.find(u => u.email === credentials.email);
      
      if (foundUser) {
        const userData: User = {
          ...foundUser,
          id: foundUser._id // For backward compatibility
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUser = mockDB.users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Create new user
      const newUser: User = {
        _id: `user_${Date.now()}`,
        username: userData.username,
        email: userData.email,
        passwordHash: `hashed_${userData.password}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        bio: userData.bio || '',
        savedPosts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: `user_${Date.now()}` // For backward compatibility
      };

      // Add to mock database (in real app, this would be API call)
      (mockDB.users as User[]).push(newUser);
      
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      navigate('/');
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const updateProfile = async (updateData: Partial<User>): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser: User = {
        ...user,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  const followUser = (targetUserId: string): void => {
    if (!user) return;
    // Simple implementation without useFollows to avoid circular dependency
    console.log('Follow user:', targetUserId);
  };

  const unfollowUser = (targetUserId: string): void => {
    if (!user) return;
    // Simple implementation without useFollows to avoid circular dependency
    console.log('Unfollow user:', targetUserId);
  };

  const isUserFollowing = (_targetUserId: string): boolean => {
    if (!user) return false;
    // Simple implementation - can be enhanced later
    return false;
  };

  const savePost = (postId: string): void => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      savedPosts: [...(user.savedPosts || []), postId]
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const unsavePost = (postId: string): void => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      savedPosts: (user.savedPosts || []).filter(id => id !== postId)
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isPostSaved = (postId: string): boolean => {
    if (!user) return false;
    return (user.savedPosts || []).includes(postId);
  };

  // Review functions (alias for post functions)
  const saveReview = (reviewId: string): void => {
    savePost(reviewId);
  };

  const unsaveReview = (reviewId: string): void => {
    unsavePost(reviewId);
  };

  const isReviewSaved = (reviewId: string): boolean => {
    return isPostSaved(reviewId);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    followUser,
    unfollowUser,
    isFollowing: isUserFollowing,
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
