import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { FaGamepad, FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Vui lòng nhập email');
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      setIsLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message);
      setIsSuccess(true);
      
      // Show reset token for development (remove in production)
      if (response.data.resetToken) {
        console.log('Reset token for development:', response.data.resetToken);
        setMessage(prev => prev + ` (Development token: ${response.data.resetToken})`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Back Button */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>

          {!isSuccess ? (
            <>
              {/* Title */}
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-orange-400 to-pink-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
                <p className="text-gray-600">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                      required
                    />
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
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    'Gửi link đặt lại'
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Email đã được gửi!</h1>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Vui lòng kiểm tra email của bạn và click vào link để đặt lại mật khẩu.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Lưu ý:</strong> Link sẽ hết hạn sau 1 giờ. Nếu bạn không thấy email, hãy kiểm tra thư mục spam.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Gửi lại email
                </button>
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

export default ForgotPasswordPage;