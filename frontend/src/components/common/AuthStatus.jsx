import React from 'react';
import { useAuth } from '../../hooks';

const AuthStatus = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-300 p-4 rounded-lg shadow-lg z-50">
        <p className="text-sm font-semibold text-red-800">❌ Chưa đăng nhập</p>
        <p className="text-xs text-red-600 mt-1">
          Truy cập <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">/login</a> hoặc <a href="/test" className="text-indigo-600 hover:text-indigo-500 font-medium">/test</a>
        </p>
        <p className="text-xs text-red-600 mt-1">
          Server: <strong>http://localhost:5174</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-300 p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3 mb-2">
        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
        <div>
          <p className="font-semibold text-sm text-green-800">✅ {user.name}</p>
          <p className="text-xs text-green-600">{user.email}</p>
        </div>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
              logout();
            }
          }}
          className="w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600 transition-colors"
        >
          Đăng xuất
        </button>
        <a
          href="/test"
          className="block w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition-colors text-center"
        >
          Test Page
        </a>
      </div>
    </div>
  );
};

export default AuthStatus;
