import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../api/auth';
import { FaGamepad, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Token đặt lại mật khẩu không hợp lệ');
        setIsValidating(false);
        return;
      }

      try {
        const response = await validateResetToken(token);
        if (response.data.valid) {
          setIsValidToken(true);
          setUserEmail(response.data.email);
        } else {
          setError(response.data.message || 'Token không hợp lệ hoặc đã hết hạn');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(token, password, confirmPassword);
      setMessage(response.data.message);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.' }
        });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang xác thực token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="bg-gradient-to-r from-red-400 to-pink-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Token không hợp lệ</h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  to="/forgot-password"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Yêu cầu link mới
                </Link>
                <Link 
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-indigo-600 mb-4 hover:scale-110 transition-transform">
            <FaGamepad className="w-10 h-10 text-indigo-600 animate-bounce" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Game Hub
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {!isSuccess ? (
            <>
              {/* Title */}
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLock className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
                <p className="text-gray-600">
                  Tạo mật khẩu mới cho tài khoản <strong>{userEmail}</strong>
                </p>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium mb-2">Mật khẩu phải có:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Ít nhất 6 ký tự</li>
                  <li>• Ít nhất 1 chữ thường (a-z)</li>
                  <li>• Ít nhất 1 chữ hoa (A-Z)</li>
                  <li>• Ít nhất 1 số (0-9)</li>
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      <span>Đang đặt lại...</span>
                    </div>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Thành công!</h1>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Mật khẩu của bạn đã được đặt lại thành công.
                </p>
                <p className="text-sm text-gray-500">
                  Bạn sẽ được chuyển đến trang đăng nhập trong 3 giây...
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Nhớ mật khẩu rồi?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Cần hỗ trợ? <a href="#" className="text-indigo-600 hover:text-indigo-500">Liên hệ support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;