import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks'; // Import useAuth to update user context
import { FaTimes, FaSave, FaUpload } from 'react-icons/fa';

const EditProfileModal = ({ open, onClose, initial, onSave }) => {
  const { updateProfile, user } = useAuth(); // Get updateProfile function and user from context
  const [formData, setFormData] = useState({
    username: initial?.username || '',
    bio: initial?.bio || '',
    avatarUrl: initial?.avatarUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatarUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);

  // Update form data when user context changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setFormData({
          username: updatedUser.username || '',
          bio: updatedUser.bio || '',
          avatarUrl: updatedUser.avatarUrl || ''
        });
        setAvatarPreview(updatedUser.avatarUrl || '');
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update preview when URL changes
    if (name === 'avatarUrl') {
      setAvatarPreview(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        avatarUrl: '' // Clear URL when file is selected
      });
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = formData.avatarUrl;
      if (selectedFile) {
        const { uploadImage } = await import('../../api/users');
        const uploadResult = await uploadImage(selectedFile);
        avatarUrl = uploadResult.url;
      }
      
      const updatedData = { ...formData, avatarUrl };
      const result = await updateProfile(updatedData); 
      
      if (result.success) {
        await onSave(updatedData); 
        onClose();
      } else {
        console.error('Error updating profile:', result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên người dùng
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giới thiệu bản thân
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Viết vài dòng giới thiệu về bản thân..."
            />
          </div>

          {/* Avatar Preview and Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            
            {/* Avatar Preview */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <FaUpload />
                  <span className="text-sm font-medium">Chọn ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG hoặc GIF (tối đa 5MB)</p>
              </div>
            </div>
            
            {/* URL Input */}
            <input
              type="url"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="Hoặc nhập URL ảnh trực tiếp"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              disabled={!!selectedFile}
            />
            
            {/* Clear file button */}
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setAvatarPreview(initial?.avatarUrl || '');
                  setFormData({
                    ...formData,
                    avatarUrl: initial?.avatarUrl || ''
                  });
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Xóa ảnh đã chọn
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
            >
              <FaSave className="text-sm" />
              <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;