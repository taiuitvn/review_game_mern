import React, { useState } from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  className = '',
  size = 'md', // xs, sm, md, lg, xl
  variant = 'default', // default, success, warning, error
  disabled = false,
  readonly = false,
  leftIcon,
  rightIcon,
  helperText,
  error = false,
  success = false,
  fullWidth = true,
  rounded = false, // true for fully rounded, false for regular rounded
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
    xl: 'px-4 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    default: error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : success
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };

  // Base classes
  const baseClasses = `
    block w-full ${sizeClasses[size]} ${variantClasses[variant]}
    bg-white placeholder-gray-600
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
    ${rounded ? 'rounded-full' : 'rounded-xl'}
    ${fullWidth ? 'w-full' : ''}
    ${isFocused ? 'ring-2 ring-opacity-50' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
  `;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
            error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : ''}`}>
              {leftIcon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          className={`${baseClasses} shadow-sm hover:shadow-md`}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : ''}`}>
              {rightIcon}
            </span>
          </div>
        )}

        {/* Status Indicators */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className={`mt-2 text-sm transition-colors duration-200 ${
          error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && typeof error === 'string' && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;