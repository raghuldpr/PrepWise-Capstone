import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  icon: Icon = null,
  size = 'md',
  className = '',
  ...rest
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  };

  const variantStyles = {
    default:
      'bg-[#EFECE6] dark:bg-[#242424] text-[#C85232] dark:text-[#D9603B] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] font-semibold',
    primary:
      'bg-[#C85232]/10 dark:bg-[#C85232]/20 text-[#C85232] dark:text-[#D9603B] border border-[#C85232]/30 font-semibold',
    terracotta:
      'bg-[#C85232] text-white border border-transparent font-semibold',
    neutral:
      'bg-[#EAE6DF] dark:bg-[#242424] text-[#111111] dark:text-white border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)]',
    success:
      'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    danger:
      'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
    info:
      'bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800',
    easy:
      'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold',
    medium:
      'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold',
    hard:
      'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
      {children}
    </span>
  );
}
