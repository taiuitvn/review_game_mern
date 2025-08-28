import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGamepad, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Kiểm tra thông tin đăng nhập cơ bản
      if (formData.email && formData.password) {
        login(formData);
        // Navigate manually to ensure redirect works
        setTimeout(() => navigate('/'), 100);
      } else {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Giả lập social login
    setIsLoading(true);
    setTimeout(() => {
      login({ email: `${provider}@social.com`, social: true });
      setIsLoading(false);
      // Navigate manually to ensure redirect works
      setTimeout(() => navigate('/'), 100);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Link to="/" className="relative inline-flex items-center gap-2 text-3xl font-bold text-indigo-600 mb-2 transition-transform hover:scale-110">
              <FaGamepad className="w-10 h-10 text-indigo-600 animate-bounce" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GameHub
              </span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng trở lại! Hãy đăng nhập để tiếp tục.</p>

          {/* Show redirect reason if coming from protected route */}
          {window.location.search.includes('redirect=') && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">ℹ️</span>
                <span>Bạn cần đăng nhập để truy cập trang này</span>
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="mb-6">
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Đăng nhập</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}



          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 pl-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-600 ${
                  formData.email
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="your@email.com"
              />
              {formData.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaCheckCircle className="text-green-500 w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-600 ${
                  formData.password
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me & Submit */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-800 mb-2 font-medium">💡 Tài khoản demo:</p>
          <div className="text-xs text-indigo-700 space-y-1">
            <p><strong>Email:</strong> demo@gamehub.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
