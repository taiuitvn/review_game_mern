import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-6">Trang test để kiểm tra routing</p>

        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </Link>

          <Link
            to="/register"
            className="block w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
          >
            Go to Register
          </Link>

          <Link
            to="/"
            className="block w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <p className="text-sm text-yellow-800">
            Nếu bạn thấy trang này, routing đã hoạt động!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
