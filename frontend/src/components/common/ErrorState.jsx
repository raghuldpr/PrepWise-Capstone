import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({
  message = 'An error occurred while fetching data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="card-warm dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-12 text-center my-6 min-h-[260px] border-amber-200 dark:border-amber-900/30">
      <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 border border-rose-200 dark:border-rose-900/30">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white mb-2">
        Unable to Load Content
      </h3>
      <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-md mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary-warm">
          <RotateCcw size={16} /> Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;
