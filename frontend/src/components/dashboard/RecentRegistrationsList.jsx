import React from 'react';
import { ArrowRight, ChevronRight, User } from 'lucide-react';

const RecentRegistrationsList = ({
  guests = [],
  loading = false,
  onViewAll,
  onSelectGuest
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#31747d] rounded-full inline-block" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Recent Registrations
          </h2>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#31747d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-10 text-center text-xs text-gray-400">Loading recent registrations...</div>
      ) : guests.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400 italic">
          No guest registrations found yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {guests.map((item) => {
            const guestName = item.guest?.name || 'Unnamed Guest';
            const guestPhone = item.guest?.phone || '-';
            const relationship = item.relationship || 'Guest';
            const rating = item.feedback?.rating;
            const followUp = item.followUp?.required;
            const initial = guestName.trim().charAt(0).toUpperCase() || 'G';

            return (
              <div
                key={item._id}
                onClick={() => onSelectGuest && onSelectGuest(item._id)}
                className="py-3 px-2 sm:px-3 rounded-2xl hover:bg-gray-50/80 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                {/* Left: Avatar + Name + Phone */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#31747d]/10 text-[#31747d] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#31747d] transition-colors truncate">
                      {guestName}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                      {guestPhone}
                    </p>
                  </div>
                </div>

                {/* Right: Relationship badge + Rating + Action icon */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Relationship category */}
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 truncate max-w-[150px]">
                    {relationship}
                  </span>

                  {/* Follow-up flag */}
                  {followUp && (
                    <span className="hidden md:inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Follow-up
                    </span>
                  )}

                  {/* Rating */}
                  {rating ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ★ {rating}/5
                    </span>
                  ) : null}

                  {/* Navigation Icon */}
                  <span className="text-gray-300 group-hover:text-[#31747d] group-hover:translate-x-0.5 transition-all">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentRegistrationsList;
