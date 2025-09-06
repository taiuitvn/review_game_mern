import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGames } from '../api/rawgApi';
import { FaSearch, FaStar, FaTimes, FaEye, FaSave, FaImage, FaMagic, FaFileAlt, FaLightbulb } from 'react-icons/fa';
import { createPost } from '../api/reviews';
import { useAuth } from '../hooks';
import { useNotification } from '../contexts/NotificationContext';
import MenuBar from '../components/editor/MenuBar';

// Import TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Import CSS cho trình soạn thảo
import '../styles/editor.css';

const CreateReviewPage = () => {
    const navigate = useNavigate();

    // Authentication and notification hooks
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useNotification();
    
    // Loading state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho các thành phần form
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(0);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // State cho việc tìm kiếm game
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const debounceTimeout = useRef(null);

    // State cho tính năng nâng cao
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [wordCount, setWordCount] = useState(0);

    // Cấu hình TipTap editor với auto-save và real-time validation
    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Cảm nghĩ của bạn về game này...</p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const newWordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            setWordCount(newWordCount);
            
            // Real-time validation for content
            validateField('content', text);
            
            // Auto-save draft (with throttling)
            if (isAuthenticated) {
                handleAutoSave();
            }
        }
    });

    // Real-time validation function
    const validateField = (fieldName, value) => {
        setErrors(currentErrors => {
            const newErrors = { ...currentErrors };
            
            switch (fieldName) {
                case 'game':
                    if (value) {
                        delete newErrors.game;
                    } else {
                        newErrors.game = 'Vui lòng chọn game để review';
                    }
                    break;
                case 'title':
                    if (!value?.trim()) {
                        newErrors.title = 'Tiêu đề không được để trống';
                    } else if (value.length < 10) {
                        newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
                    } else if (value.length > 200) {
                        newErrors.title = 'Tiêu đề không được quá 200 ký tự';
                    } else {
                        delete newErrors.title;
                    }
                    break;
                case 'rating':
                    if (value === 0 || !value) {
                        newErrors.rating = 'Vui lòng đánh giá game (1-5 sao)';
                    } else {
                        delete newErrors.rating;
                    }
                    break;
                case 'content':
                    const content = typeof value === 'string' ? value : (editor?.getText() || '');
                    const currentWordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                    if (!content.trim() || content === 'Cảm nghĩ của bạn về game này...') {
                        newErrors.content = 'Vui lòng viết nội dung review';
                    } else if (currentWordCount < 50) {
                        newErrors.content = 'Review nên có ít nhất 50 từ';
                    } else {
                        delete newErrors.content;
                    }
                    break;
                case 'tags':
                    if (!value || value.length === 0) {
                        newErrors.tags = 'Vui lòng thêm ít nhất 1 tag';
                    } else if (value.length > 10) {
                        newErrors.tags = 'Không được thêm quá 10 tags';
                    } else {
                        delete newErrors.tags;
                    }
                    break;
            }
            
            return newErrors;
        });
    };

    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            showWarning('Bạn cần đăng nhập để viết review');
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate, showWarning]);

    // Auto-save functionality
    const handleAutoSave = async () => {
        if (isSaving) return;
        const content = editor?.getHTML();
        if (!content || content === '<p></p>') return;
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLastSaved(new Date());
            setIsDraft(true);
            const draftData = {
                id: draftId || Date.now().toString(),
                title, content, rating, tags, selectedGame,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('review-draft', JSON.stringify(draftData));
            if (!draftId) setDraftId(draftData.id);
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        setSelectedGame(null);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (query) {
            debounceTimeout.current = setTimeout(async () => {
                const { data } = await searchGames(query);
                setSearchResults(data.results || []);
            }, 500);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectGame = (game) => {
        setSelectedGame(game);
        setTitle(game.name || '');
        setSearchTerm('');
        setSearchResults([]);
        validateField('game', game);
        validateField('title', game.name || '');
        showSuccess(`Đã chọn game: ${game.name}`);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag) && tags.length < 10) {
                const newTags = [...tags, newTag];
                setTags(newTags);
                setTagInput('');
                validateField('tags', newTags);
            } else if (tags.includes(newTag)) {
                showWarning('Tag này đã tồn tại');
            } else {
                showWarning('Không thể thêm quá 10 tags');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        validateField('tags', newTags);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showError('Bạn cần đăng nhập để đăng bài');
            navigate('/login');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const content = editor.getHTML();
            const reviewData = {
                title: title.trim(),
                content, tags, rating,
                gameId: selectedGame?.id?.toString(),
                gameName: selectedGame?.name,
                gameImage: selectedGame?.background_image,
            };
            const response = await createPost(reviewData);
            if (isDraft) {
                localStorage.removeItem('review-draft');
                setIsDraft(false);
                setDraftId(null);
            }
            showSuccess('🎉 Bài review đã được đăng thành công!');
            const postId = response?.data?._id || response?._id;
            if (postId) {
                navigate(`/review/${postId}`);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Submit failed:', error);
            let errorMessage = 'Có lỗi xảy ra khi đăng bài. Vui lòng thử lại!';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            showError(`❌ ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = () => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar 
                    key={star} 
                    onClick={() => {
                        setRating(star);
                        validateField('rating', star);
                    }}
                    className={`cursor-pointer transition-colors hover:scale-110 ${
                        rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`} 
                    size={24} 
                />
            ))}
        </div>
    );

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="p-4 md:p-8">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl mb-6 shadow-lg">
                <div className="px-6 md:px-8 py-6 flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <FaFileAlt className="text-2xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Viết Review</h1>
                        <p className="text-white/90">Chia sẻ góc nhìn về tựa game bạn yêu thích</p>
                    </div>
                </div>
            </div>
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">✍️ Viết bài Review mới</h1>
                            <p className="text-gray-500">Chia sẻ cảm nghĩ của bạn về một tựa game cho mọi người.</p>
                        </div>
                    </div>
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <h3 className="text-red-800 font-medium mb-2">Vui lòng sửa các lỗi sau:</h3>
                            <ul className="text-red-700 text-sm space-y-1">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>• {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* Tìm kiếm Game */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                1. Tìm kiếm game <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Cyberpunk 2077..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                        errors.game
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                />
                            </div>
                            {errors.game && (
                                <p className="text-red-500 text-sm mt-1">{errors.game}</p>
                            )}
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-72 overflow-y-auto shadow-2xl">
                                    {searchResults.map(game => (
                                        <li key={game.id} onClick={() => handleSelectGame(game)} className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                                            <img src={game.background_image} alt={game.name} className="w-16 h-10 object-cover rounded-lg ring-1 ring-gray-200"/>
                                            <span className="text-sm font-medium text-gray-800">{game.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Tiêu đề Review */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                                2. Tiêu đề bài viết <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    const newTitle = e.target.value;
                                    setTitle(newTitle);
                                    validateField('title', newTitle);
                                }}
                                placeholder="Ví dụ: Cyberpunk 2077 - Một trải nghiệm tuyệt vời nhưng đầy tranh cãi"
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                    errors.title
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500'
                                }`}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                {title.length}/200 ký tự (tối thiểu 10 ký tự)
                            </p>
                        </div>

                        {/* Trình soạn thảo TipTap */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                3. Nội dung Review <span className="text-red-500">*</span>
                            </label>
                            <div className={`border rounded-xl overflow-hidden ${
                                errors.content ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                                    <MenuBar editor={editor} />
                                </div>
                                <div className="p-6" style={{ height: '300px', overflowY: 'auto' }}>
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                            )}
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>Số từ: {wordCount}</span>
                                <span>Độ dài tối thiểu: 50 từ</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        {/* Game đã chọn */}
                        {selectedGame && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Game đã chọn</label>
                                <div className="bg-gray-50 p-4 rounded-lg text-center border-2 border-green-200">
                                    <img src={selectedGame.background_image} alt={selectedGame.name} className="w-full h-32 object-cover rounded-lg mx-auto"/>
                                    <h3 className="font-semibold mt-2">{selectedGame.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Đã chọn ✓</p>
                                </div>
                            </div>
                        )}

                        {!selectedGame && (
                            <div className="bg-gray-50 p-4 rounded-lg text-center border-2 border-dashed border-gray-300">
                                <FaSearch className="text-gray-400 text-3xl mb-2 mx-auto" />
                                <p className="text-gray-600 text-sm">Chưa chọn game</p>
                            </div>
                        )}

                        {/* Đánh giá */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                4. Đánh giá của bạn <span className="text-red-500">*</span>
                            </label>
                            <StarRating />
                            <p className="text-center text-2xl font-bold mt-2 text-gray-700">{rating}/5</p>
                            {rating > 0 && (
                                <p className="text-center text-sm text-gray-600 mt-1">
                                    {rating === 1 && 'Rất tệ'}
                                    {rating === 2 && 'Tệ'}
                                    {rating === 3 && 'Bình thường'}
                                    {rating === 4 && 'Tốt'}
                                    {rating === 5 && 'Xuất sắc'}
                                </p>
                            )}
                            {errors.rating && (
                                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                            )}
                        </div>

                        {/* Thêm Tags */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                5. Thêm Tags <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm">
                                        #{tag}
                                        <FaTimes onClick={() => removeTag(tag)} className="cursor-pointer hover:text-red-500"/>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    if (errors.tags && tags.length > 0) {
                                        validateField('tags', tags);
                                    }
                                }}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Nhập tag rồi nhấn Enter..."
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 placeholder-gray-600 ${
                                    errors.tags
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500'
                                }`}
                            />
                            {errors.tags && (
                                <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                {tags.length} tag(s) - Tối đa 10 tags
                            </p>
                        </div>

                        {/* Submit button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isSubmitting || Object.keys(errors).length > 0}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <FaMagic />
                                {isSubmitting ? 'Đang đăng bài...' : 'Đăng bài Review'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewPage;