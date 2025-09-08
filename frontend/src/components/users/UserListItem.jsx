import React from 'react';
import { FaUser, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UserListItem = ({ user, currentUser, onFollow, onUnfollow, isFollowing }) => {
  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFollowing) {
      onUnfollow && onUnfollow(user._id);
    } else {
      onFollow && onFollow(user._id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <Link 
          to={`/profile/${user._id}`} 
          className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
        >
          {/* Avatar */}
          <div className="relative">
            {user.avatarUrl || user.avatar ? (
              <img 
                src={user.avatarUrl || user.avatar} 
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
            )}
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 hover:text-indigo-600 transition-colors">
                {user.username}
              </h3>
              {user.isVerified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{user.email}</p>
            
            {user.bio && (
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">{user.bio}</p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-700">{user.followersCount || 0}</span>
                <span>người theo dõi</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-700">{user.followingCount || 0}</span>
                <span>đang theo dõi</span>
              </div>
              {user.reviewsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">{user.reviewsCount}</span>
                  <span>bài review</span>
                </div>
              )}
            </div>
            
            {/* Join Date */}
            {user.createdAt && (
              <p className="text-xs text-gray-400 mt-2">
                Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </Link>

        {/* Follow Button */}
        {currentUser && currentUser._id !== user._id && (
          <button
            onClick={handleFollowClick}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isFollowing ? (
              <>
                <FaUserCheck className="text-sm" />
                <span>Đang theo dõi</span>
              </>
            ) : (
              <>
                <FaUserPlus className="text-sm" />
                <span>Theo dõi</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserListItem;