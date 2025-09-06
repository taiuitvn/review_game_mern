import React from 'react';

const LoginPromptModal = ({ show, onClose, title, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 break-words leading-relaxed">{title}</h2>
        <p className="text-gray-600 mb-6 break-words leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Đóng
          </button>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center whitespace-nowrap"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
