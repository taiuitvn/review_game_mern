import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useNotifications } from '../../hooks/useNotifications';
import LoginPromptModal from '../common/LoginPromptModal';

import {
  FaGamepad, FaHome, FaFire, FaPlus, FaUserCircle, FaSignOutAlt,
  FaSearch, FaChevronDown, FaDesktop, FaPlaystation, FaXbox, FaBars, FaTimes,
  FaSignInAlt, FaUserPlus, FaBell
} from 'react-icons/fa';

const Header = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  // State management
  const [isGenresOpen, setGenresOpen] = useState(false);
  const [isPlatformsOpen, setPlatformsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  // Refresh user data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      // This will trigger a re-render with updated user data
      // The useAuth hook already handles localStorage updates
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleProtectedAction = (title, message) => {
    setModalContent({ title, message });
    setShowLoginModal(true);
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FaGamepad className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">GameHub</span>
                    <div className="text-xs text-gray-500 hidden sm:block">Nơi chia sẻ game</div>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm game..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-12 pr-4 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm placeholder-gray-600 text-gray-900"
                />
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink to="/" className={navLinkClasses}>
                <FaHome className="w-4 h-4" />
                Trang chủ
              </NavLink>
              <NavLink to="/trending" className={navLinkClasses}>
                <FaFire className="w-4 h-4" />
                Thịnh hành
              </NavLink>
              <NavLink to="/search" className={navLinkClasses}>
                <FaSearch className="w-4 h-4" />
                Tìm kiếm
              </NavLink>

              
              {/* Genres Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setGenresOpen(true)}
                  onMouseLeave={() => setGenresOpen(false)}
                  onClick={() => setGenresOpen(!isGenresOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  Thể loại
                  <FaChevronDown className={`w-3 h-3 transition-all duration-300 ${isGenresOpen ? 'rotate-180 text-indigo-500' : 'group-hover:text-indigo-500'}`} />
                </button>
                <div 
                  className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 transform transition-all duration-300 ${isGenresOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
                  onMouseEnter={() => setGenresOpen(true)}
                  onMouseLeave={() => setGenresOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thể loại game</p>
                  </div>
                  <Link to="/genres/action" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Action
                  </Link>
                  <Link to="/genres/rpg" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    RPG
                  </Link>
                  <Link to="/genres/adventure" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Adventure
                  </Link>
                  <Link to="/genres/fps" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    FPS
                  </Link>
                  <Link to="/genres/strategy" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Strategy
                  </Link>
                  <Link to="/genres/sports" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Sports
                  </Link>
                  <Link to="/genres/racing" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                    Racing
                  </Link>
                  <Link to="/genres/simulation" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    Simulation
                  </Link>
                  <Link to="/genres/horror" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                    Horror
                  </Link>
                  <Link to="/genres/puzzle" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    Puzzle
                  </Link>
                  <Link to="/genres/fighting" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Fighting
                  </Link>
                  <Link to="/genres/mmorpg" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    MMORPG
                  </Link>
                </div>
              </div>

              {/* Platforms Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setPlatformsOpen(true)}
                  onMouseLeave={() => setPlatformsOpen(false)}
                  onClick={() => setPlatformsOpen(!isPlatformsOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  Nền tảng
                  <FaChevronDown className={`w-3 h-3 transition-all duration-300 ${isPlatformsOpen ? 'rotate-180 text-purple-500' : 'group-hover:text-purple-500'}`} />
                </button>
                <div 
                  className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 transform transition-all duration-300 ${isPlatformsOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}
                  onMouseEnter={() => setPlatformsOpen(true)}
                  onMouseLeave={() => setPlatformsOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nền tảng game</p>
                  </div>
                  <Link to="/platforms/pc" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaDesktop className="w-4 h-4 text-blue-500" /> PC
                  </Link>
                  <Link to="/platforms/playstation" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaPlaystation className="w-4 h-4 text-indigo-500" /> PlayStation
                  </Link>
                  <Link to="/platforms/xbox" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaXbox className="w-4 h-4 text-green-500" /> Xbox
                  </Link>
                  <Link to="/platforms/nintendo-switch" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaGamepad className="w-4 h-4 text-red-500" /> Nintendo Switch
                  </Link>
                  <Link to="/platforms/mobile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaGamepad className="w-4 h-4 text-pink-500" /> Mobile
                  </Link>
                  <Link to="/platforms/steam" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaDesktop className="w-4 h-4 text-gray-600" /> Steam
                  </Link>
                  <Link to="/platforms/epic-games" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaGamepad className="w-4 h-4 text-yellow-500" /> Epic Games
                  </Link>
                  <Link to="/platforms/vr" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaGamepad className="w-4 h-4 text-purple-500" /> VR
                  </Link>
                  <Link to="/platforms/retro" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 transform hover:translate-x-1">
                    <FaGamepad className="w-4 h-4 text-orange-500" /> Retro
                  </Link>
                </div>
              </div>
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-3">

              
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <>
                  {/* Notifications Button */}
                  <Link 
                    to="/notifications"
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaBell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Create Review Button */}
                  <NavLink 
                    to="/create-review" 
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span className="hidden lg:inline">Viết Review</span>
                  </NavLink>

                  {/* User Menu */}
                  <div className="relative group">
                    <Link
                      to={`/profile/${user._id || user.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img 
                        src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user._id || user.id}`} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover" 
                        onError={(e) => {
                          e.target.src = `https://i.pravatar.cc/150?u=${user._id || user.id}`;
                        }}
                      />
                      <span className="hidden md:inline font-medium text-gray-700">{user.username}</span>
                    </Link>
                    
                    {/* User Dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link 
                        to={`/profile/${user._id || user.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <FaUserCircle className="w-4 h-4" />
                        Hồ sơ
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                            logout();
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    <FaSignInAlt className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <FaUserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng ký</span>
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm game..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm placeholder-gray-600 text-gray-900"
                />
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <FaHome className="w-5 h-5" />
                  Trang chủ
                </NavLink>
                <NavLink to="/trending" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <FaFire className="w-5 h-5" />
                  Thịnh hành
                </NavLink>
                {/* <NavLink to="/search" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                  <FaSearch className="w-5 h-5" />
                  Tìm kiếm
                </NavLink> */}
                
                {user && (
                  <NavLink to="/notifications" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <FaBell className="w-5 h-5" />
                        Thông báo
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </NavLink>
                )}
                
                {user ? (
                  <NavLink to="/create-review" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
                    <FaPlus className="w-5 h-5" />
                    Viết Review
                  </NavLink>
                ) : (
                  <button
                    onClick={() => {
                      handleProtectedAction(
                        'Đăng nhập để viết review',
                        'Bạn cần đăng nhập để có thể tạo và chia sẻ bài review về game yêu thích của mình.'
                      );
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                  >
                    <FaPlus className="w-5 h-5" />
                    Viết Review
                  </button>
                )}
                
                {/* User Profile Section - Mobile */}
                {user && (
                  <div className="border-t border-gray-200 pt-4">
                    <Link 
                      to={`/profile/${user._id || user.id}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <img 
                        src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user._id || user.id}`} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover" 
                        onError={(e) => {
                          e.target.src = `https://i.pravatar.cc/150?u=${user._id || user.id}`;
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">Xem hồ sơ</div>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                          logout();
                          setMobileMenuOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
                
                {!user && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3 bg-gray-100 text-indigo-600 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}

                {/* Mobile Genres */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Thể loại</p>
                  <div className="space-y-1">
                    <Link to="/genres/action" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Action</Link>
                    <Link to="/genres/rpg" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>RPG</Link>
                    <Link to="/genres/adventure" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Adventure</Link>
                  </div>
                </div>

                {/* Mobile Platforms */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Nền tảng</p>
                  <div className="space-y-1">
                    <Link to="/platforms/pc" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <FaDesktop className="w-4 h-4" /> PC
                    </Link>
                    <Link to="/platforms/playstation" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <FaPlaystation className="w-4 h-4" /> PlayStation
                    </Link>
                    <Link to="/platforms/xbox" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <FaXbox className="w-4 h-4" /> Xbox
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Click outside to close dropdowns */}
      {(isGenresOpen || isPlatformsOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setGenresOpen(false);
            setPlatformsOpen(false);
          }}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </>
  );
};

export default Header;
