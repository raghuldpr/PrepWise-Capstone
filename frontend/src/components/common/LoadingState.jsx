import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading content...' }) => {
  return (
    <div className="card-warm dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-12 text-center my-6 min-h-[240px]">
      <Loader2 className="animate-spin text-[#C85232] mb-4" size={36} />
      <p className="text-base font-medium text-[#111111] dark:text-white font-body">
        {message}
      </p>
      <span className="text-sm text-[#5E5B56] dark:text-[#A0A0A0] mt-1">
        Please wait while we prepare your data
      </span>
    </div>
  );
};

export default LoadingState;
