import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '' 
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePageClick = (page) => {
    console.log('Pagination handlePageClick called with:', page, typeof page);
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      console.log('Calling onPageChange with page:', page);
      onPageChange(page);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* First page button */}
      {showFirstLast && currentPage > 2 && (
        <button
          onClick={() => handlePageClick(1)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          title="First page"
        >
          <FaAnglesLeft className="text-sm" />
        </button>
      )}

      {/* Previous page button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={isFirstPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          isFirstPage
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
        title="Previous page"
      >
        <FaChevronLeft className="text-sm" />
      </button>

      {/* Page numbers */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border font-medium transition-colors ${
            page === currentPage
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next page button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={isLastPage}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          isLastPage
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
        title="Next page"
      >
        <FaChevronRight className="text-sm" />
      </button>

      {/* Last page button */}
      {showFirstLast && currentPage < totalPages - 1 && (
        <button
          onClick={() => handlePageClick(totalPages)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          title="Last page"
        >
          <FaAnglesRight className="text-sm" />
        </button>
      )}

      {/* Page info */}
      <div className="ml-4 text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;