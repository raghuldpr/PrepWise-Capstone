import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  title = 'No Data Found',
  description = 'There are currently no items to display in this section.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="card-warm dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-12 text-center my-6 min-h-[280px]">
      <div className="w-14 h-14 rounded-full bg-[#EAE6DF] dark:bg-[#242424] flex items-center justify-center text-[#C85232] mb-4 border border-[rgba(200,82,50,0.2)]">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold font-heading text-[#111111] dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-base text-[#5E5B56] dark:text-[#A0A0A0] max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-terracotta">
          {actionLabel} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
