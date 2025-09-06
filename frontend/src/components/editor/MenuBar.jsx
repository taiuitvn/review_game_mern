import React from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaStrikethrough, 
  FaListUl, 
  FaListOl, 
  FaQuoteLeft,
  FaCode,
  FaUndo,
  FaRedo
} from 'react-icons/fa';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const Button = ({ onClick, isActive = false, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Text formatting */}
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <FaBold />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <FaItalic />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <FaStrikethrough />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <FaCode />
      </Button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </Button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <FaListUl />
      </Button>

      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <FaListOl />
      </Button>

      {/* Quote */}
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <FaQuoteLeft />
      </Button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Undo/Redo */}
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <FaUndo />
      </Button>

      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        <FaRedo />
      </Button>
    </div>
  );
};

export default MenuBar;