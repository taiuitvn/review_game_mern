import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  className = '',
  disabled = false,
  variant = 'primary', // primary, secondary, success, danger, warning, info, light, dark, outline
  size = 'md', // xs, sm, md, lg, xl
  rounded = false, // true for fully rounded, false for regular rounded
  block = false, // true for full width
  loading = false, // true to show loading state
  leftIcon,
  rightIcon
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-transparent shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-transparent shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-transparent shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-transparent shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-transparent shadow-lg hover:shadow-xl',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-transparent shadow-lg hover:shadow-xl',
    light: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 border-transparent shadow-md hover:shadow-lg',
    
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-md hover:shadow-lg'
  };

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    transform hover:scale-105 active:scale-95
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${rounded ? 'rounded-full' : 'rounded-xl'}
    ${block ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : 'cursor-pointer'}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}

      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>

      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;