import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon = null,
  ...rest
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C85232] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary:
      'bg-[#C85232] text-white hover:bg-[#A43A1E] active:bg-[#8F3017] shadow-none border border-transparent',
    secondary:
      'bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] hover:bg-[#DFD9CE] dark:hover:bg-[#2D2D2D]',
    outline:
      'bg-transparent text-[#111111] dark:text-white border border-[#C85232] hover:bg-[#C85232]/10 text-[#C85232]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent',
    ghost:
      'bg-transparent text-[#111111] dark:text-white hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.08)] border border-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md min-h-[32px]',
    md: 'text-sm md:text-base px-6 py-3 rounded-lg min-h-[44px]',
    lg: 'text-base md:text-lg px-8 py-3.5 rounded-lg min-h-[48px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
          {children}
        </>
      )}
    </button>
  );
}
