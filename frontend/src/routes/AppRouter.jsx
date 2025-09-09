import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import HomePage from '../pages/HomePage';
import CreateReviewPage from '../pages/CreateReviewPage';
import EditReviewPage from '../pages/EditReviewPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TrendingPage from '../pages/TrendingPage';
import SearchPage from '../pages/SearchPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import NotificationsPage from '../pages/NotificationsPage';

import GenrePage from '../pages/filters/GenrePage';
import PlatformPage from '../pages/filters/PlatformPage';
import Header from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/common/ScrollToTop';

// Component bảo vệ route cần đăng nhập
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Only redirect if we're not already on a public route
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      return <Navigate to="/login?redirect=protected" replace />;
    }
  }
  
  return children;
};

const AppRouter = () => {

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Scroll to top on route change */}
      <ScrollToTop />
      
      {/* Header cho tất cả user */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Routes công khai - không cần đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/search" element={<SearchPage />} />

          <Route path="/review/:id" element={<ReviewDetailPage />} />
          
          {/* Routes cần đăng nhập */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/create-review" element={
            <ProtectedRoute>
              <CreateReviewPage />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-review/:id" element={
            <ProtectedRoute>
              <EditReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          
          {/* Routes filter - công khai */}
          <Route path="/genres/:genre" element={<GenrePage />} />
          <Route path="/platforms/:platform" element={<PlatformPage />} />
          
          {/* Debug routes đã được xóa */}
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppRouter;