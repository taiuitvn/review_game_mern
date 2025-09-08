import React from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
      {/* Panel */}
      <div className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-8 break-words">{title}</h3>
          </div>
        )}

        <div className="px-6 py-4 text-gray-800 dark:text-gray-100 break-words leading-relaxed">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-950/50 rounded-b-2xl">
            {footer}
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full p-2
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
