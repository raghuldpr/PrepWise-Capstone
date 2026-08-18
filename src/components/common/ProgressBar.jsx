import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  showValue = true,
  height = 'h-2.5',
  colorClass = 'bg-[#C85232]',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100))) || 0;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-[#111111] dark:text-white">
          <span>{label}</span>
          {showValue && <span>{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-[#EAE6DF] dark:bg-[#242424] ${height} rounded-full overflow-hidden border border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.08)]`}
      >
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
