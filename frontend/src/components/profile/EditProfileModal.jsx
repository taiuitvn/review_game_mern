import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { FaEdit, FaUserPlus, FaClipboardList } from "react-icons/fa";

export default function EditProfileModal({ open, onClose, onSave, initial }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(initial?.username || "");
    setBio(initial?.bio || "");
    setAvatarUrl(initial?.avatarUrl || "");
  }, [initial, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await (onSave?.({ username, bio, avatarUrl }) || Promise.resolve());
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chỉnh sửa hồ sơ"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-white/10
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white
                       hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar preview */}
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={avatarUrl || "https://i.pravatar.cc/150?u=default"}
              alt="Avatar preview"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
              onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=default"; }}
            />
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full shadow-lg">
              <FaEdit className="text-white text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Xem trước ảnh đại diện</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <span className="bg-blue-500 text-white p-1 rounded-lg"><FaUserPlus className="text-xs" /></span>
            Tên người dùng
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Nhập tên người dùng"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <span className="bg-emerald-500 text-white p-1 rounded-lg"><FaClipboardList className="text-xs" /></span>
            Giới thiệu
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            placeholder="Chia sẻ đôi chút về bạn…"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">URL ảnh đại diện</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10
                       bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
            type="url"
          />
        </div>
      </form>
    </Modal>
  );
}
