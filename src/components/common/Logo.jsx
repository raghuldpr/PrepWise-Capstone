import React from 'react';

/**
 * PrepWise Official Brand Logo Component
 * Renders the official PrepWise icon with fallback support.
 */
export default function Logo({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  const selectedSize = sizeMap[size] || size;

  return (
    <img
      src="/apple-touch-icon.png"
      alt="PrepWise"
      className={`${selectedSize} object-contain shadow-xs shrink-0 select-none ${className}`}
      onError={(e) => {
        // Fallback to favicon-32x32 if apple-touch-icon fails to load
        e.currentTarget.src = '/favicon-32x32.png';
      }}
    />
  );
}
