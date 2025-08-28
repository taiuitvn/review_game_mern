import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaGamepad className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">GameHub</h3>
                <div className="text-sm text-gray-400">Nơi chia sẻ game</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Nền tảng đánh giá và chia sẻ game hàng đầu, nơi cộng đồng game thủ có thể
              khám phá, đánh giá và thảo luận về những tựa game yêu thích.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                <FaDiscord className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Thịnh hành
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Tìm kiếm
                </Link>
              </li>
              <li>
                <Link to="/create-review" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Viết Review
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Chính sách
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} GameHub. All Rights Reserved.
            </div>
            <div className="text-gray-400 text-sm">
              Made with ❤️ by UIT IE224.P21.LT Team 1
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;