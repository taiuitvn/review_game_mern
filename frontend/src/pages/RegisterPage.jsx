import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGamepad, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error khi user bắt đầu nhập
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên người dùng là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Đăng ký tài khoản
      register(formData);
      // Navigate manually to ensure redirect works
      setTimeout(() => navigate('/'), 100);
    } catch (err) {
      setErrors({ general: 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Giả lập social register
    setIsLoading(true);
    setTimeout(() => {
      register({
        username: `${provider}User${Date.now()}`,
        email: `${provider}@social.com`,
        password: 'social123',
        confirmPassword: 'social123',
        bio: `Đăng ký qua ${provider}`
      });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600">Tham gia cộng đồng game thủ ngay hôm nay!</p>
        </div>

        {/* Register Form */}
        <div className="mb-6">
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Đăng ký tài khoản</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Tên người dùng
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-600 ${
                  formData.username && !errors.username
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : errors.username
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Nhập tên người dùng"
              />
              {formData.username && !errors.username && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaCheckCircle className="text-green-500 w-5 h-5" />
                </div>
              )}
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-600 ${
                  formData.email && !errors.email
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="your@email.com"
              />
              {formData.email && !errors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaCheckCircle className="text-green-500 w-5 h-5" />
                </div>
              )}
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-600 ${
                  formData.password && !errors.password
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  formData.confirmPassword && !errors.confirmPassword
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Bio (Optional) */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
              Giới thiệu bản thân <span className="text-gray-500">(tùy chọn)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 placeholder-gray-600"
              placeholder="Hãy cho mọi người biết về sở thích game của bạn..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                <span>Đang tạo tài khoản...</span>
              </div>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-800 mb-2 font-medium">💡 Mẹo:</p>
          <p className="text-xs text-indigo-700">
            Bạn có thể bỏ qua việc điền bio và để trống nếu không muốn chia sẻ thông tin cá nhân.
          </p>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
