import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'normal',
  hoverable = false,
  onClick = null,
  dark = false,
  ...rest
}) {
  const paddingStyles = {
    none: 'p-0',
    compact: 'p-4',
    normal: 'p-6 md:p-8',
    large: 'p-8 md:p-10',
  };

  const bgStyles = dark
    ? 'bg-[#1E1E1E] text-white border-[rgba(255,255,255,0.12)]'
    : 'bg-[#EFECE6] dark:bg-[#1E1E1E] text-[#111111] dark:text-white border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]';

  const hoverStyles = hoverable
    ? 'cursor-pointer hover:border-[#C85232] hover:bg-[#EAE6DF] dark:hover:bg-[#242424] transition-all duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border ${bgStyles} ${paddingStyles[padding] || paddingStyles.normal} ${hoverStyles} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
