import React from 'react';
import { ChevronRight } from 'lucide-react';

const FeedbackCard = ({ item, onClick }) => {
  const guestName = item.guest?.name || 'Unnamed Guest';
  const guestPhone = item.guest?.phone || '';
  const category = item.relationship || 'Guest';
  const rating = item.feedback?.rating;
  const comments = item.feedback?.comments?.trim() || '';
  const initial = guestName.trim().charAt(0).toUpperCase() || 'G';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="w-full bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-[#31747d]/30 rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer group shadow-2xs text-left"
    >
      {/* Top Row: Avatar + Name + Phone (Left) & Rating + Chevron (Right) */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#31747d]/10 text-[#31747d] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#31747d] transition-colors truncate">
              {guestName}
            </h4>
            {guestPhone && (
              <p className="text-[11px] text-gray-400 font-mono leading-none mt-0.5 truncate">
                {guestPhone}
              </p>
            )}
          </div>
        </div>

        {/* Right: Rating Badge & Chevron Arrow */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {rating ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/90 leading-tight">
              ★ {rating}/5
            </span>
          ) : null}
          <ChevronRight size={14} className="text-gray-300 group-hover:text-[#31747d] group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>

      {/* Second Row: Guest Category */}
      <div className="mt-1.5">
        <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-gray-100/80 text-gray-700 border border-gray-200/50 truncate max-w-full">
          {category}
        </span>
      </div>

      {/* Third Row: Feedback Content (Only if available) */}
      {comments && (
        <div className="mt-1.5 text-[11px] text-gray-600 bg-gray-50/70 border border-gray-100/90 rounded-lg p-2 line-clamp-2 leading-relaxed">
          {comments}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
