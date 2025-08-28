import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGames } from '../api/rawgApi';
import { FaSearch, FaStar, FaTimes, FaEye, FaSave, FaImage, FaMagic, FaFileAlt, FaLightbulb } from 'react-icons/fa';
import MenuBar from '../components/editor/MenuBar';

// Import TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Import CSS cho trình soạn thảo
import '../styles/editor.css';

const CreateReviewPage = () => {
    const navigate = useNavigate();

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

    // Templates cho review
    const reviewTemplates = {
        standard: {
            name: 'Đánh giá tiêu chuẩn',
            content: `<h2>Giới thiệu</h2>
<p>Game này mang đến những trải nghiệm gì đặc biệt?</p>

<h2>Điểm mạnh</h2>
<ul>
<li><p>Đồ họa và âm thanh</p></li>
<li><p>Cốt truyện và nhân vật</p></li>
<li><p>Gameplay và cơ chế</p></li>
</ul>

<h2>Điểm yếu</h2>
<ul>
<li><p>Những vấn đề gặp phải</p></li>
<li><p>Điểm cần cải thiện</p></li>
</ul>

<h2>Kết luận</h2>
<p>Đánh giá tổng thể và lời khuyên cho người chơi.</p>`
        },
        quick: {
            name: 'Đánh giá nhanh',
            content: `<p><strong>Game này có gì hay?</strong></p>
<p>Viết cảm nhận tổng quan về game...</p>

<p><strong>Điểm cộng:</strong></p>
<p>Liệt kê những điểm mạnh...</p>

<p><strong>Điểm trừ:</strong></p>
<p>Liệt kê những điểm yếu...</p>

<p><strong>Đánh giá:</strong> X/10</p>`
        },
        detailed: {
            name: 'Đánh giá chi tiết',
            content: `<h1>Review chi tiết</h1>

<h2>🎮 Tổng quan</h2>
<p>Mô tả tổng quan về game, thể loại, nhà phát hành...</p>

<h2>📊 Thông số kỹ thuật</h2>
<p>Yêu cầu hệ thống, nền tảng hỗ trợ...</p>

<h2>🎨 Đồ họa & Âm thanh</h2>
<p>Đánh giá về visual, sound design...</p>

<h2>🎯 Gameplay</h2>
<p>Trải nghiệm chơi, cơ chế, độ khó...</p>

<h2>📖 Cốt truyện & Nhân vật</h2>
<p>Đánh giá về story, character development...</p>

<h2>⚖️ Ưu & Nhược điểm</h2>
<h3>Ưu điểm:</h3>
<ul>
<li><p></p></li>
<li><p></p></li>
</ul>

<h3>Nhược điểm:</h3>
<ul>
<li><p></p></li>
<li><p></p></li>
</ul>

<h2>💰 Giá trị & Lời khuyên</h2>
<p>Đánh giá về giá cả, khuyến nghị mua/sale...</p>

<h2>🏆 Kết luận</h2>
<p>Đánh giá tổng thể và điểm số.</p>`
        }
    };

    // Cấu hình TipTap editor với auto-save (không auto-resize)
    const editor = useEditor({
        extensions: [StarterKit],
        content: selectedTemplate ? reviewTemplates[selectedTemplate].content : '<p>Cảm nghĩ của bạn về game này...</p>',
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);

            // Auto-save draft
            handleAutoSave();
        }
    });

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!selectedGame) {
            newErrors.game = 'Vui lòng chọn game để review';
        }

        if (!title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        } else if (title.length < 10) {
            newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
        }

        if (rating === 0) {
            newErrors.rating = 'Vui lòng đánh giá game (1-5 sao)';
        }

        const content = editor?.getText() || '';
        if (!content.trim() || content === 'Cảm nghĩ của bạn về game này...') {
            newErrors.content = 'Vui lòng viết nội dung review';
        } else if (wordCount < 50) {
            newErrors.content = 'Review nên có ít nhất 50 từ';
        }

        if (tags.length === 0) {
            newErrors.tags = 'Vui lòng thêm ít nhất 1 tag';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Auto-save functionality
    const handleAutoSave = async () => {
        if (isSaving) return;

        const content = editor?.getHTML();
        if (!content || content === '<p></p>') return;

        setIsSaving(true);
        try {
            // Simulate API call to save draft
            await new Promise(resolve => setTimeout(resolve, 500));

            setLastSaved(new Date());
            setIsDraft(true);
            // Here you would save to localStorage or send to API
            const draftData = {
                id: draftId || Date.now().toString(),
                title,
                content,
                rating,
                tags,
                selectedGame,
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

    // Load draft functionality
    const loadDraft = () => {
        const draft = localStorage.getItem('review-draft');
        if (draft) {
            const draftData = JSON.parse(draft);
            setTitle(draftData.title || '');
            setRating(draftData.rating || 0);
            setTags(draftData.tags || []);
            setSelectedGame(draftData.selectedGame || null);
            setDraftId(draftData.id);
            setIsDraft(true);
            if (editor && draftData.content) {
                editor.commands.setContent(draftData.content);
            }
        }
    };

    // Template selection
    const handleTemplateSelect = (templateKey) => {
        setSelectedTemplate(templateKey);
        if (editor) {
            editor.commands.setContent(reviewTemplates[templateKey].content);
        }
    };

    // Preview functionality
    const togglePreview = () => {
        setIsPreviewMode(!isPreviewMode);
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
        setTitle(game.name);
        setSearchTerm('');
        setSearchResults([]);
        // Clear game error
        if (errors.game) {
            setErrors(prev => ({ ...prev, game: null }));
        }
    };

    // Load draft on component mount
    useEffect(() => {
        loadDraft();
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);



    // Update word count when content changes
    useEffect(() => {
        if (editor) {
            const text = editor.getText();
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
        }
    }, [editor?.getText()]);

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        const content = editor.getHTML();
        const reviewData = {
            gameId: selectedGame.id,
            gameName: selectedGame.name,
            gameImage: selectedGame.background_image,
            title: title.trim(),
            content,
            rating,
            tags,
            wordCount,
            author: 'current-user', // Would come from auth context
            createdAt: new Date().toISOString()
        };

        try {
            // Here you would make API call
            console.log("Submitting Review Data:", reviewData);

            // Clear draft if it exists
            if (isDraft) {
                localStorage.removeItem('review-draft');
            }

            alert("🎉 Bài review đã được đăng thành công!");
            navigate('/');
        } catch (error) {
            console.error("Submit failed:", error);
            alert("❌ Có lỗi xảy ra khi đăng bài. Vui lòng thử lại!");
        }
    };

    const handleSaveDraft = () => {
        handleAutoSave();
        alert("📝 Đã lưu bản nháp!");
    };

    const handleClearDraft = () => {
        if (confirm("Bạn có chắc muốn xóa bản nháp này?")) {
            localStorage.removeItem('review-draft');
            setIsDraft(false);
            setDraftId(null);
            setLastSaved(null);
            setTitle('');
            setRating(0);
            setTags([]);
            setSelectedGame(null);
            setSelectedTemplate(null);
            if (editor) {
                editor.commands.setContent('<p>Cảm nghĩ của bạn về game này...</p>');
            }
        }
    };

    const StarRating = () => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} onClick={() => setRating(star)}
                    className={`cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} size={24} />
            ))}
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            {/* Hero */}
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
                {/* Header with enhanced toolbar */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">✍️ Viết bài Review mới</h1>
                            <p className="text-gray-500">Chia sẻ cảm nghĩ của bạn về một tựa game cho mọi người.</p>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Template selector */}
                            <select
                                value={selectedTemplate || ''}
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Chọn template</option>
                                {Object.entries(reviewTemplates).map(([key, template]) => (
                                    <option key={key} value={key}>{template.name}</option>
                                ))}
                            </select>

                            {/* Draft status */}
                            {isDraft && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                                    <FaSave />
                                    <span>Đã lưu nháp</span>
                                    {lastSaved && (
                                        <span className="text-xs">
                                            {new Date(lastSaved).toLocaleTimeString('vi-VN')}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Preview toggle */}
                            <button
                                onClick={togglePreview}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isPreviewMode
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <FaEye />
                                {isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}
                            </button>

                            {/* Save draft */}
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <FaSave />
                                {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
                            </button>

                            {/* Clear draft */}
                            {isDraft && (
                                <button
                                    onClick={handleClearDraft}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    <FaTimes />
                                    Xóa nháp
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status messages */}
                    {isSaving && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm mb-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Đang tự động lưu...</span>
                        </div>
                    )}

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

                {isPreviewMode ? (
                    /* Preview Mode */
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaEye className="text-indigo-600" />
                            <h2 className="text-xl font-bold text-gray-900">Xem trước bài viết</h2>
                        </div>

                        {selectedGame && (
                            <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
                                <img src={selectedGame.background_image} alt={selectedGame.name} className="w-full h-48 object-cover" />
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-lg font-bold">
                                            {rating}
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold">{title}</h1>
                                            <p className="text-gray-300">{selectedGame.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="bg-indigo-600 px-2 py-1 rounded text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div
                                        className="prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: editor?.getHTML() }}
                                    />
                                </div>
                            </div>
                        )}

                        {!selectedGame && (
                            <div className="text-center py-12 bg-gray-100 rounded-lg">
                                <FaFileAlt className="text-gray-400 text-4xl mb-4 mx-auto" />
                                <p className="text-gray-600">Chọn game và viết nội dung để xem preview</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Edit Mode */
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Cột trái: Nội dung chính */}
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
                                        setTitle(e.target.value);
                                        if (errors.title) {
                                            setErrors(prev => ({ ...prev, title: null }));
                                        }
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
                                    {title.length}/100 ký tự (tối thiểu 10 ký tự)
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
                                    <div className="p-6" style={{ height: '440px', overflowY: 'auto' }}>
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

                                {/* Writing tips */}
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <FaLightbulb className="text-blue-600 mt-1 flex-shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Mẹo viết review:</p>
                                            <ul className="space-y-1 text-xs">
                                                <li>• Giới thiệu ngắn gọn về game</li>
                                                <li>• Phân tích ưu và nhược điểm</li>
                                                <li>• Đánh giá gameplay và đồ họa</li>
                                                <li>• Khuyến nghị đối tượng chơi</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Thông tin phụ */}
                        <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
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
                                        if (errors.tags) {
                                            setErrors(prev => ({ ...prev, tags: null }));
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
                                    {tags.length} tag(s) - Mỗi tag cách nhau bởi dấu cách
                                </p>

                                {/* Tag suggestions */}
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Tag gợi ý:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {['action', 'adventure', 'rpg', 'indie', 'multiplayer', 'singleplayer', 'open-world'].map(suggestion => (
                                            !tags.includes(suggestion) && (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => {
                                                        if (!tags.includes(suggestion)) {
                                                            setTags([...tags, suggestion]);
                                                        }
                                                    }}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    + #{suggestion}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    disabled={Object.keys(errors).length > 0}
                                >
                                    <FaMagic />
                                    Đăng bài Review
                                </button>

                                {/* Progress indicator */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Hoàn thành</span>
                                        <span>{Math.round(((selectedGame ? 1 : 0) + (title.length >= 10 ? 1 : 0) + (rating > 0 ? 1 : 0) + (wordCount >= 50 ? 1 : 0) + (tags.length > 0 ? 1 : 0)) / 5 * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.round(((selectedGame ? 1 : 0) + (title.length >= 10 ? 1 : 0) + (rating > 0 ? 1 : 0) + (wordCount >= 50 ? 1 : 0) + (tags.length > 0 ? 1 : 0)) / 5 * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateReviewPage;