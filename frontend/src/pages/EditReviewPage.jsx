import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchGames, getGenres, getPlatforms } from '../api/rawgApi';
import { FaSearch, FaStar, FaTimes, FaEye, FaSave, FaImage, FaMagic, FaFileAlt, FaLightbulb, FaArrowLeft, FaGamepad } from 'react-icons/fa';
import { getReviewById, updateReview } from '../api/reviews';
import { useAuth } from '../hooks';
import { useNotification } from '../contexts/NotificationContext';
import MenuBar from '../components/editor/MenuBar';

// Import TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Import CSS cho trình soạn thảo
import '../styles/editor.css';

const EditReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Authentication and notification hooks
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useNotification();
    
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
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

    // State cho platforms và genres
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [availablePlatforms, setAvailablePlatforms] = useState([]);

    // State cho tính năng nâng cao
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [wordCount, setWordCount] = useState(0);
    
    // Ref to track if data has been loaded
    const dataLoaded = useRef(false);
    const contentToLoad = useRef(null);

    // Cấu hình TipTap editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const newWordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            setWordCount(newWordCount);
            
            // Real-time validation for content
            validateField('content', text);
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
                    if (!content.trim()) {
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

    // Load existing review data
    useEffect(() => {
        const loadReview = async () => {
            if (!isAuthenticated) {
                showWarning('Bạn cần đăng nhập để chỉnh sửa review');
                navigate('/login');
                return;
            }

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                showError('ID review không hợp lệ');
                navigate('/');
                return;
            }

            try {
                setIsLoading(true);
                const response = await getReviewById(id);
                const reviewData = response?.data?.data || response?.data || response;

                if (!reviewData) {
                    showError('Không tìm thấy review');
                    navigate('/');
                    return;
                }

                // Check ownership
                const currentUserId = user?._id || user?.id;
                const reviewAuthorId = reviewData.authorId?._id || reviewData.authorId;
                
                if (currentUserId !== reviewAuthorId) {
                    showError('Bạn chỉ có thể chỉnh sửa review của chính mình');
                    navigate(`/review/${id}`);
                    return;
                }

                // Populate form fields
                setTitle(reviewData.title || '');
                setRating(reviewData.rating || 0);
                setTags(reviewData.tags || []);
                
                // Set selected game data
                if (reviewData.gameName || reviewData.gameId) {
                    setSelectedGame({
                        id: reviewData.gameId,
                        name: reviewData.gameName,
                        background_image: reviewData.gameImage || reviewData.coverImageUrl
                    });
                }

                // Set platforms and genres
                setSelectedPlatforms(reviewData.platforms || []);
                setSelectedGenres(reviewData.genres || []);

                // Store content to be set later when editor is ready
                if (reviewData.content) {
                    // Set content immediately if editor is ready
                    if (editor) {
                        editor.commands.setContent(reviewData.content);
                    }
                    // Also store in a ref for later use
                    contentToLoad.current = reviewData.content;
                }

                showInfo('Đã tải dữ liệu review để chỉnh sửa');
                
            } catch (error) {
                console.error('Error loading review:', error);
                showError('Không thể tải dữ liệu review');
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (id && editor && !dataLoaded.current) {
            dataLoaded.current = true;
            loadReview();
        }
    }, [id, editor, isAuthenticated, user, navigate]); // Removed notification functions from dependencies

    // Load available genres and platforms
    useEffect(() => {
        const loadGenresAndPlatforms = async () => {
            try {
                const [genresResponse, platformsResponse] = await Promise.all([
                    getGenres(),
                    getPlatforms()
                ]);
                
                setAvailableGenres(genresResponse.data.results || []);
                setAvailablePlatforms(platformsResponse.data.results || []);
            } catch (error) {
                console.error('Error loading genres and platforms:', error);
            }
        };

        loadGenresAndPlatforms();
    }, []);

    // Set editor content when editor is ready
    useEffect(() => {
        if (editor && contentToLoad.current) {
            editor.commands.setContent(contentToLoad.current);
            contentToLoad.current = null; // Clear after setting
        }
    }, [editor]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (query) {
            debounceTimeout.current = setTimeout(async () => {
                try {
                    const { data } = await searchGames(query);
                    setSearchResults(data.results || []);
                } catch (error) {
                    console.error('Error searching games:', error);
                }
            }, 500);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectGame = (game) => {
        setSelectedGame(game);
        setSearchTerm('');
        setSearchResults([]);
        validateField('game', game);
        showSuccess(`Đã chọn game: ${game.name}`);
        
        // Log game data to see available platform information
        console.log('Selected game data (Edit):', {
            game,
            platforms: game.platforms,
            parent_platforms: game.parent_platforms,
            genres: game.genres
        });
    };

    // Handle genre selection
    const handleGenreToggle = (genre) => {
        setSelectedGenres(prev => {
            const isSelected = prev.some(g => g.id === genre.id);
            if (isSelected) {
                return prev.filter(g => g.id !== genre.id);
            } else {
                return [...prev, genre];
            }
        });
    };

    // Handle platform selection
    const handlePlatformToggle = (platform) => {
        setSelectedPlatforms(prev => {
            const isSelected = prev.some(p => p.id === platform.id);
            if (isSelected) {
                return prev.filter(p => p.id !== platform.id);
            } else {
                return [...prev, platform];
            }
        });
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

    const validateForm = () => {
        const newErrors = {};
        
        // Validate all fields
        if (!selectedGame) newErrors.game = 'Vui lòng chọn game để review';
        if (!title?.trim()) newErrors.title = 'Tiêu đề không được để trống';
        else if (title.length < 10) newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
        else if (title.length > 200) newErrors.title = 'Tiêu đề không được quá 200 ký tự';
        
        if (rating === 0) newErrors.rating = 'Vui lòng đánh giá game (1-5 sao)';
        
        const content = editor?.getText() || '';
        const currentWordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        if (!content.trim()) newErrors.content = 'Vui lòng viết nội dung review';
        else if (currentWordCount < 50) newErrors.content = 'Review nên có ít nhất 50 từ';
        
        if (tags.length === 0) newErrors.tags = 'Vui lòng thêm ít nhất 1 tag';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showError('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData = {
                title: title.trim(),
                content: editor.getHTML(),
                rating: rating,
                tags: tags,
                gameId: selectedGame?.id,
                gameName: selectedGame?.name,
                gameImage: selectedGame?.background_image,
                platforms: selectedPlatforms,
                genres: selectedGenres,
            };

            console.log('Updating review with platform data:', {
                platforms: gamePlatforms,
                genres: gameGenres,
                selectedGame: selectedGame
            });

            const response = await updateReview(id, updateData);
            
            if (response.success || response.data) {
                showSuccess('Đã cập nhật review thành công!');
                navigate(`/review/${id}`);
            } else {
                throw new Error('Update response indicates failure');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            showError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu review...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(`/review/${id}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Quay lại review</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Review</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Game Selection */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaSearch className="text-indigo-600" />
                                    Game được review
                                </h3>
                                
                                {selectedGame ? (
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <img 
                                            src={selectedGame.background_image} 
                                            alt={selectedGame.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{selectedGame.name}</h4>
                                            <p className="text-sm text-gray-600">Đã chọn</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedGame(null);
                                                validateField('game', null);
                                            }}
                                            className="ml-auto text-red-500 hover:text-red-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            placeholder="Tìm kiếm game..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                                {searchResults.map((game) => (
                                                    <div
                                                        key={game.id}
                                                        onClick={() => handleSelectGame(game)}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <img 
                                                            src={game.background_image} 
                                                            alt={game.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{game.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Phát hành: {game.released || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.game && <p className="text-red-500 text-sm mt-2">{errors.game}</p>}
                            </div>

                            {/* Title */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaFileAlt className="text-indigo-600" />
                                    Tiêu đề Review
                                </h3>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        validateField('title', e.target.value);
                                    }}
                                    placeholder="Nhập tiêu đề hấp dẫn cho review của bạn..."
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
                                <p className="text-gray-500 text-sm mt-2">{title.length}/200 ký tự</p>
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FaFileAlt className="text-indigo-600" />
                                        Nội dung Review
                                    </h3>
                                </div>
                                
                                {editor && <MenuBar editor={editor} />}
                                
                                <div className="p-6">
                                    <EditorContent 
                                        editor={editor} 
                                        className="prose max-w-none min-h-[300px] focus:outline-none"
                                    />
                                    {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
                                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                                        <span>{wordCount} từ</span>
                                        <span>Tối thiểu 50 từ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Rating */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaStar className="text-yellow-500" />
                                    Đánh giá
                                </h3>
                                <div className="flex items-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                setRating(star);
                                                validateField('rating', star);
                                            }}
                                            className={`text-3xl transition-colors ${
                                                star <= rating ? 'text-yellow-500' : 'text-gray-300'
                                            } hover:text-yellow-400`}
                                        >
                                            <FaStar />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-gray-600 text-center">
                                        {rating} ⭐
                                    </p>
                                )}
                                {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder="Nhập tag và nhấn Enter..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {errors.tags && <p className="text-red-500 text-sm mt-2">{errors.tags}</p>}
                                <p className="text-gray-500 text-sm mt-2">{tags.length}/10 tags</p>
                            </div>

                            {/* Genres */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaGamepad className="text-purple-500" />
                                    Thể loại
                                </h3>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                    {availableGenres.map((genre) => {
                                        const isSelected = selectedGenres.some(g => g.id === genre.id);
                                        return (
                                            <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleGenreToggle(genre)}
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-700">{genre.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-gray-500 text-sm mt-2">{selectedGenres.length} thể loại đã chọn</p>
                            </div>

                            {/* Platforms */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaGamepad className="text-blue-500" />
                                    Nền tảng
                                </h3>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                    {availablePlatforms.map((platform) => {
                                        const isSelected = selectedPlatforms.some(p => p.id === platform.id);
                                        return (
                                            <label key={platform.id} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handlePlatformToggle(platform)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{platform.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="text-gray-500 text-sm mt-2">{selectedPlatforms.length} nền tảng đã chọn</p>
                            </div>

                            {/* Submit Button */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Cập nhật Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReviewPage;