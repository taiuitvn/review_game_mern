import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { FaArrowLeft, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const AuthPopup = () => {
  const [view, setView] = useState('initial'); // 'initial' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { closeModal } = useModal();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await login({ email, password });
      closeModal();
    } catch (error) {
      setErrors({ general: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.' });
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderInitialView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng bạn!</h2>
        <p className="text-gray-600">Đăng nhập hoặc tạo tài khoản miễn phí</p>
      </div>

      {/* Email Input */}
      <div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          leftIcon={<FaEnvelope />}
          size="lg"
          rounded
          className="mb-4"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            setView('login');
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Hoặc đăng nhập bằng tên người dùng
        </button>
      </div>

      {/* Continue Button */}
      <Button
        onClick={() => setView('login')}
        variant="primary"
        size="lg"
        block
        rounded
        leftIcon={<FaEnvelope />}
      >
        Tiếp tục với email
      </Button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm font-medium">hoặc tiếp tục với</span>
        <hr className="flex-grow border-gray-300" />
      </div>



      {/* Terms */}
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        Bằng cách tiếp tục, bạn đồng ý với{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-800">Điều khoản dịch vụ</a>
        {' '}và{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-800">Chính sách quyền riêng tư</a>
      </p>
    </div>
  );

  const renderLoginView = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setView('initial')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
      >
        <FaArrowLeft />
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaLock className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
        <p className="text-gray-600">Chào mừng bạn trở lại!</p>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email hoặc tên người dùng"
          leftIcon={<FaEnvelope />}
          size="lg"
          rounded
          required
          error={errors.email}
        />

        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          leftIcon={<FaLock />}
          size="lg"
          rounded
          required
          error={errors.password}
        />

        {/* Forgot Password */}
        <div className="text-right">
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Quên mật khẩu?
          </a>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          rounded
          loading={loading}
          leftIcon={!loading && <FaLock />}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-500 text-sm">hoặc</span>
        <hr className="flex-grow border-gray-300" />
      </div>


    </div>
  );

  return (
    <div className="max-w-md mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        {view === 'initial' ? renderInitialView() : renderLoginView()}
      </div>
    </div>
  );
};

export default AuthPopup;