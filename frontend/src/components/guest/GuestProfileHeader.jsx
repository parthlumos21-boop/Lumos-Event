import React, { useState } from 'react';

const GuestProfileHeader = ({
  guest,
  stats,
  onEdit,
  onRefresh,
  loading
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const guestName = guest?.guest?.name || 'Guest Profile';
  const guestIdCode = guest?._id ? `GST-${guest._id.slice(-5).toUpperCase()}` : 'GST-00001';
  const ratingVal = guest?.feedback?.rating || 3;

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-xs font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Avatar + Identity */}
        <div className="flex items-center gap-4">
          {/* Circular Teal Avatar */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#82c8cf] flex items-center justify-center shrink-0 shadow-xs">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#82c8cf] border-2 border-white flex items-center justify-center">
              <i className="fa-solid fa-user text-white text-2xl" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {guestName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono tracking-wider font-semibold">
              {guestIdCode}
            </p>
          </div>
        </div>

        {/* Center/Right: 3 Metric Cards + Actions */}
        <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto">
          {/* Rating Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-4 py-2.5 text-center min-w-[90px] flex items-center gap-2.5">
            <i className="fa-solid fa-star text-amber-400 text-base" />
            <div className="text-left leading-tight">
              <span className="text-sm font-extrabold text-gray-900 block font-mono">
                {ratingVal}/5
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Rating</span>
            </div>
          </div>

          {/* Changes Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-4 py-2.5 text-center min-w-[90px] flex items-center gap-2.5">
            <i className="fa-solid fa-rotate text-[#31747d] text-base" />
            <div className="text-left leading-tight">
              <span className="text-sm font-extrabold text-gray-900 block font-mono">
                {stats?.totalChanges || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Changes</span>
            </div>
          </div>

          {/* Activities Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-4 py-2.5 text-center min-w-[90px] flex items-center gap-2.5">
            <i className="fa-solid fa-calendar-days text-[#31747d] text-base" />
            <div className="text-left leading-tight">
              <span className="text-sm font-extrabold text-gray-900 block font-mono">
                {stats?.totalActivities || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Activities</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto lg:ml-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-pen text-xs" />
              <span>Edit</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>More</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-gray-400" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onRefresh();
                    }}
                    disabled={loading}
                    className="w-full px-3.5 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  >
                    <i className={`fa-solid fa-rotate ${loading ? 'fa-spin text-[#31747d]' : ''}`} />
                    <span>Refresh Record</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestProfileHeader;
