import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGames, getGenres, getPlatforms } from '../api/rawgApi';
import { FaSearch, FaStar, FaTimes, FaEye, FaSave, FaImage, FaMagic, FaFileAlt, FaLightbulb, FaPlus, FaGamepad } from 'react-icons/fa';
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

    // State cho tính năng tự tạo game
    const [isCustomGameMode, setIsCustomGameMode] = useState(false);
    const [customGameName, setCustomGameName] = useState('');
    const [customGameGenres, setCustomGameGenres] = useState([]);
    const [customGamePlatforms, setCustomGamePlatforms] = useState([]);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [availablePlatforms, setAvailablePlatforms] = useState([]);

    // State cho tính năng nâng cao
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDraft, setIsDraft] = useState(false);
    const [draftId, setDraftId] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [wordCount, setWordCount] = useState(0);

    // State cho upload hình ảnh tùy chỉnh
    const [customImage, setCustomImage] = useState(null);
    const [customImagePreview, setCustomImagePreview] = useState(null);
    const [imageHash, setImageHash] = useState(null);
    const fileInputRef = useRef(null);

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

    // Load available genres and platforms on component mount
    useEffect(() => {
        const loadGenresAndPlatforms = async () => {
            try {
                console.log('Loading genres and platforms...');
                const [genresData, platformsData] = await Promise.all([
                    getGenres(),
                    getPlatforms()
                ]);
                console.log('Genres data:', genresData);
                console.log('Platforms data:', platformsData);
                setAvailableGenres(genresData.data.results || []);
                setAvailablePlatforms(platformsData.data.results || []);
                console.log('Available genres set:', genresData.data.results?.length || 0);
                console.log('Available platforms set:', platformsData.data.results?.length || 0);
            } catch (error) {
                console.error('Error loading genres and platforms:', error);
                showError('Không thể tải danh sách thể loại và nền tảng');
            }
        };

        loadGenresAndPlatforms();
    }, []);

    // Load draft from localStorage on component mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem('review-draft');
                if (savedDraft) {
                    const draftData = JSON.parse(savedDraft);
                    console.log('Loading draft:', draftData);
                    
                    // Restore form data
                    if (draftData.title) setTitle(draftData.title);
                    if (draftData.rating) setRating(draftData.rating);
                    if (draftData.tags) setTags(draftData.tags);
                    if (draftData.selectedGame) setSelectedGame(draftData.selectedGame);
                    
                    // Restore editor content when editor is ready
                    if (draftData.content && editor) {
                        editor.commands.setContent(draftData.content);
                    }
                    
                    setIsDraft(true);
                    setDraftId(draftData.id);
                    showInfo('Đã khôi phục bản nháp trước đó');
                }
            } catch (error) {
                console.error('Error loading draft:', error);
                localStorage.removeItem('review-draft'); // Remove corrupted draft
            }
        };

        // Only load draft if user is authenticated
        if (isAuthenticated) {
            loadDraft();
        }
    }, [isAuthenticated, editor, showInfo]);

    // Toggle custom game mode
    const toggleCustomGameMode = () => {
        setIsCustomGameMode(!isCustomGameMode);
        if (!isCustomGameMode) {
            // Reset search when entering custom mode
            setSearchTerm('');
            setSearchResults([]);
            setSelectedGame(null);
        } else {
            // Reset custom game data when exiting custom mode
            setCustomGameName('');
            setCustomGameGenres([]);
            setCustomGamePlatforms([]);
        }
    };

    // Handle custom game genre selection
    const handleGenreToggle = (genre) => {
        console.log('Genre toggle clicked:', genre);
        setCustomGameGenres(prev => {
            const isSelected = prev.some(g => g.id === genre.id);
            console.log('Genre is selected:', isSelected);
            if (isSelected) {
                const newGenres = prev.filter(g => g.id !== genre.id);
                console.log('Removing genre, new list:', newGenres);
                return newGenres;
            } else {
                const newGenres = [...prev, genre];
                console.log('Adding genre, new list:', newGenres);
                return newGenres;
            }
        });
    };

    // Handle custom game platform selection
    const handlePlatformToggle = (platform) => {
        console.log('Platform toggle clicked:', platform);
        setCustomGamePlatforms(prev => {
            const isSelected = prev.some(p => p.id === platform.id);
            console.log('Platform is selected:', isSelected);
            if (isSelected) {
                const newPlatforms = prev.filter(p => p.id !== platform.id);
                console.log('Removing platform, new list:', newPlatforms);
                return newPlatforms;
            } else {
                const newPlatforms = [...prev, platform];
                console.log('Adding platform, new list:', newPlatforms);
                return newPlatforms;
            }
        });
    };

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

    // Hàm tạo hash cho hình ảnh
    const generateImageHash = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const hashBuffer = new Uint8Array(arrayBuffer);
                let hash = 0;
                for (let i = 0; i < hashBuffer.length; i++) {
                    hash = ((hash << 5) - hash + hashBuffer[i]) & 0xffffffff;
                }
                resolve(hash.toString());
            };
            reader.readAsArrayBuffer(file);
        });
    };

    // Hàm xử lý upload hình ảnh tùy chỉnh
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra định dạng file
        if (!file.type.startsWith('image/')) {
            showError('Vui lòng chọn file hình ảnh hợp lệ');
            return;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('Kích thước hình ảnh không được vượt quá 5MB');
            return;
        }

        try {
            // Tạo preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setCustomImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Tạo base64 và hash
            const base64Reader = new FileReader();
            base64Reader.onload = async (e) => {
                const base64 = e.target.result;
                const hash = await generateImageHash(file);
                setCustomImage(base64);
                setImageHash(hash);
                showSuccess('Đã tải lên hình ảnh thành công');
            };
            base64Reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            showError('Có lỗi xảy ra khi tải lên hình ảnh');
        }
    };

    // Hàm xóa hình ảnh tùy chỉnh
    const removeCustomImage = () => {
        setCustomImage(null);
        setCustomImagePreview(null);
        setImageHash(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        showInfo('Đã xóa hình ảnh tùy chỉnh');
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
        
        // Log game data to see available platform information
        console.log('Selected game data:', {
            game,
            platforms: game.platforms,
            parent_platforms: game.parent_platforms,
            genres: game.genres
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
            
            // Validate all required fields before submission
            if (isCustomGameMode) {
                // Validate custom game
                if (!customGameName.trim()) {
                    showError('Vui lòng nhập tên game');
                    setIsSubmitting(false);
                    return;
                }
                if (customGameGenres.length === 0) {
                    showError('Vui lòng chọn ít nhất một thể loại cho game');
                    setIsSubmitting(false);
                    return;
                }
                if (customGamePlatforms.length === 0) {
                    showError('Vui lòng chọn ít nhất một nền tảng cho game');
                    setIsSubmitting(false);
                    return;
                }
            } else {
                validateField('game', selectedGame);
            }
            
            validateField('title', title);
            validateField('rating', rating);
            validateField('content', content);
            validateField('tags', tags);
            
            // Check if there are any validation errors
            if (Object.keys(errors).length > 0) {
                showError('Vui lòng kiểm tra và sửa các lỗi trong form');
                setIsSubmitting(false);
                return;
            }
            
            // Extract platform and genre information from selected game or custom game
            let gamePlatforms, gameGenres, gameId, gameName;
            
            if (isCustomGameMode) {
                // Use custom game data
                gamePlatforms = customGamePlatforms.map(p => p.name);
                gameGenres = customGameGenres.map(g => g.name);
                gameId = null; // Custom games don't have RAWG ID
                gameName = customGameName.trim();
            } else {
                // Use selected game data
                gamePlatforms = selectedGame?.platforms?.map(p => p.platform?.name || p.name) || [];
                gameGenres = selectedGame?.genres?.map(g => g.name) || [];
                gameId = selectedGame?.id?.toString();
                gameName = selectedGame?.name;
            }
            
            const reviewData = {
                title: title.trim(),
                content, tags, rating,
                gameId,
                gameName,
                platforms: gamePlatforms,
                genres: gameGenres,
                isCustomGame: isCustomGameMode,
            };

            // Thêm dữ liệu hình ảnh (ưu tiên hình ảnh tùy chỉnh)
            if (customImage && imageHash) {
                reviewData.imageBase64 = customImage;
                reviewData.imageHash = imageHash;
            } else if (selectedGame?.background_image) {
                reviewData.gameImage = selectedGame.background_image;
            }
            
            console.log('Creating post with platform data:', {
                platforms: gamePlatforms,
                genres: gameGenres,
                selectedGame: selectedGame
            });
            
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
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    1. {isCustomGameMode ? 'Thêm game mới' : 'Tìm kiếm game'} <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleCustomGameMode}
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        isCustomGameMode
                                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {isCustomGameMode ? (
                                        <>
                                            <FaSearch className="w-4 h-4" />
                                            <span>Tìm kiếm game</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="w-4 h-4" />
                                            <span>Thêm game mới</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {!isCustomGameMode ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    {/* Custom Game Form */}
                                    <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="flex items-center space-x-2 text-indigo-700 mb-3">
                                            <FaGamepad className="w-5 h-5" />
                                            <span className="font-medium">Thông tin game mới</span>
                                        </div>

                                        {/* Game Name Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tên game *
                                            </label>
                                            <input
                                                type="text"
                                                value={customGameName}
                                                onChange={(e) => setCustomGameName(e.target.value)}
                                                placeholder="Nhập tên game..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {/* Genres Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Thể loại ({customGameGenres.length} đã chọn)
                                            </label>
                                            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availableGenres.map((genre) => (
                                                        <label key={genre.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={customGameGenres.some(g => g.id === genre.id)}
                                                                onChange={() => handleGenreToggle(genre)}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{genre.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Platforms Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nền tảng ({customGamePlatforms.length} đã chọn)
                                            </label>
                                            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availablePlatforms.map((platform) => (
                                                        <label key={platform.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={customGamePlatforms.some(p => p.id === platform.id)}
                                                                onChange={() => handlePlatformToggle(platform)}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{platform.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {errors.game && (
                                <p className="text-red-500 text-sm mt-1">{errors.game}</p>
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
                        {/* Game đã chọn hoặc game tự tạo */}
                        {(selectedGame || (isCustomGameMode && customGameName)) && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {selectedGame ? 'Game đã chọn' : 'Game mới đã tạo'}
                                </label>
                                <div className="bg-gray-50 p-4 rounded-lg text-center border-2 border-green-200">
                                    {selectedGame ? (
                                        <>
                                            <img src={selectedGame.background_image} alt={selectedGame.name} className="w-full h-32 object-cover rounded-lg mx-auto"/>
                                            <h3 className="font-semibold mt-2">{selectedGame.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Đã chọn ✓</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-full h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg mx-auto flex items-center justify-center">
                                                <FaGamepad className="text-white text-4xl" />
                                            </div>
                                            <h3 className="font-semibold mt-2">{customGameName}</h3>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {customGameGenres.length > 0 && (
                                                    <p>Thể loại: {customGameGenres.map(g => g.name).join(', ')}</p>
                                                )}
                                                {customGamePlatforms.length > 0 && (
                                                    <p>Nền tảng: {customGamePlatforms.map(p => p.name).join(', ')}</p>
                                                )}
                                                <p className="text-green-600 font-medium">Game mới ✓</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {!selectedGame && (
                            <div className="bg-gray-50 p-4 rounded-lg text-center border-2 border-dashed border-gray-300">
                                <FaSearch className="text-gray-400 text-3xl mb-2 mx-auto" />
                                <p className="text-gray-600 text-sm">Chưa chọn game</p>
                            </div>
                        )}

                        {/* Upload hình ảnh tùy chỉnh */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hình ảnh tùy chỉnh (Tùy chọn)
                            </label>
                            <div className="space-y-3">
                                {!customImagePreview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <FaImage className="text-gray-400 text-3xl mb-2 mx-auto" />
                                        <p className="text-gray-600 text-sm mb-2">Tải lên hình ảnh của riêng bạn</p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                        >
                                            Chọn hình ảnh
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 5MB</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={customImagePreview}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeCustomImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                        <div className="mt-2 text-center">
                                            <p className="text-sm text-green-600 font-medium">✓ Hình ảnh tùy chỉnh</p>
                                            <p className="text-xs text-gray-500">Sẽ được sử dụng thay vì hình ảnh game</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Đánh giá */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                4. Đánh giá của bạn <span className="text-red-500">*</span>
                            </label>
                            <StarRating />
                            <p className="text-center text-2xl font-bold mt-2 text-gray-700">{rating}</p>
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