import React from 'react';

const LoadingSkeleton = ({ 
  variant = 'card', 
  count = 1, 
  className = '',
  ...props 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => {
    switch (variant) {
      case 'card':
        return (
          <div key={index} className={`bg-white rounded-2xl shadow-md overflow-hidden ${className}`}>
            {/* Image Skeleton */}
            <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            
            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse" />
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 animate-pulse" />
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
              </div>
              
              {/* Stats */}
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="h-3 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div key={index} className={`flex gap-4 p-4 bg-white rounded-lg ${className}`}>
            {/* Image */}
            <div className="w-24 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse flex-shrink-0" />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div key={index} className={`space-y-2 ${className}`}>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        );
        
      case 'avatar':
        return (
          <div key={index} className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        );
        
      default:
        return (
          <div key={index} className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse ${className}`} />
        );
    }
  });

  return (
    <div {...props}>
      {skeletons}
    </div>
  );
};

export default LoadingSkeleton;