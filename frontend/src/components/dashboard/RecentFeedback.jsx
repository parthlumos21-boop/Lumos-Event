import React from 'react';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import FeedbackCard from './FeedbackCard';

const RecentFeedback = ({
  guests = [],
  loading = false,
  onViewAll,
  onSelectGuest
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#31747d] rounded-full inline-block" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Recent Feedback
          </h2>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#31747d] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400 font-medium">
          Loading recent feedback...
        </div>
      ) : guests.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
            <MessageSquareQuote size={18} />
          </div>
          <p className="text-xs font-medium text-gray-500">No feedback available yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {guests.map((item) => (
            <FeedbackCard
              key={item._id}
              item={item}
              onClick={() => onSelectGuest && onSelectGuest(item._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentFeedback;
