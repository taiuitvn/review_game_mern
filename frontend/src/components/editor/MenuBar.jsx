import React from 'react';
import { FaBold, FaItalic, FaStrikethrough, FaListUl, FaListOl, FaQuoteLeft, FaRedo, FaUndo } from 'react-icons/fa';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const menuItems = [
    { action: () => editor.chain().focus().toggleBold().run(), name: 'bold', icon: <FaBold />, disabled: !editor.can().chain().focus().toggleBold().run() },
    { action: () => editor.chain().focus().toggleItalic().run(), name: 'italic', icon: <FaItalic />, disabled: !editor.can().chain().focus().toggleItalic().run() },
    { action: () => editor.chain().focus().toggleStrike().run(), name: 'strike', icon: <FaStrikethrough />, disabled: !editor.can().chain().focus().toggleStrike().run() },
    { action: () => editor.chain().focus().toggleBulletList().run(), name: 'bulletList', icon: <FaListUl /> },
    { action: () => editor.chain().focus().toggleOrderedList().run(), name: 'orderedList', icon: <FaListOl /> },
    { action: () => editor.chain().focus().toggleBlockquote().run(), name: 'blockquote', icon: <FaQuoteLeft /> },
  ];

  const historyItems = [
      { action: () => editor.chain().focus().undo().run(), name: 'undo', icon: <FaUndo />, disabled: !editor.can().chain().focus().undo().run() },
      { action: () => editor.chain().focus().redo().run(), name: 'redo', icon: <FaRedo />, disabled: !editor.can().chain().focus().redo().run() },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-b-0 border-gray-300 rounded-t-lg bg-gray-50">
        {menuItems.map(item => (
             <button
                key={item.name}
                type="button" 
                onClick={item.action}
                disabled={item.disabled}
                className={`p-2 rounded ${editor.isActive(item.name) ? 'bg-gray-300' : 'hover:bg-gray-200'} disabled:opacity-50`}
            >
                {item.icon}
            </button>
        ))}
         <div className="border-l h-6 mx-2 border-gray-300"></div>
         {historyItems.map(item => (
             <button
                key={item.name}
                onClick={item.action}
                disabled={item.disabled}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            >
                {item.icon}
            </button>
        ))}
    </div>
  );
};

export default MenuBar;
