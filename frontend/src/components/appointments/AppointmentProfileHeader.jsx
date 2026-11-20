import React, { useState } from 'react';

export const AppointmentProfileHeader = ({
  appointment,
  stats,
  onEditAll,
  onRefresh,
  loading
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const clientName = appointment?.clientName || 'Appointment Profile';
  const srNo = appointment?.srNo || 'APT-0001';
  const status = appointment?.status || 'Scheduled';

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {clientName}
            </h1>
            <p className="text-xs text-gray-400 font-mono tracking-wider font-semibold">
              {srNo}
            </p>
          </div>
        </div>

        {/* Center/Right: 3 Metric Cards + Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
          {/* Status Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-3 py-1.5 text-center min-w-[76px] sm:min-w-[82px] flex items-center gap-2">
            <i className="fa-solid fa-star text-amber-400 text-xs sm:text-sm" />
            <div className="text-left leading-tight">
              <span className="text-xs sm:text-sm font-bold text-gray-900 block font-mono">
                {status}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Status</span>
            </div>
          </div>

          {/* Changes Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-3 py-1.5 text-center min-w-[76px] sm:min-w-[82px] flex items-center gap-2">
            <i className="fa-solid fa-rotate text-[#31747d] text-xs sm:text-sm" />
            <div className="text-left leading-tight">
              <span className="text-xs sm:text-sm font-bold text-gray-900 block font-mono">
                {stats?.totalChanges || 0}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Changes</span>
            </div>
          </div>

          {/* Activities Metric */}
          <div className="bg-gray-50/80 border border-gray-200/70 rounded-2xl px-3 py-1.5 text-center min-w-[76px] sm:min-w-[82px] flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-[#31747d] text-xs sm:text-sm" />
            <div className="text-left leading-tight">
              <span className="text-xs sm:text-sm font-bold text-gray-900 block font-mono">
                {stats?.totalActivities || 0}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Activities</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto lg:ml-2">
            <button
              type="button"
              onClick={onEditAll}
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
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
                  >
                    <i className="fa-solid fa-rotate-right text-gray-400" />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      window.print();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
                  >
                    <i className="fa-solid fa-print text-gray-400" />
                    <span>Print</span>
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

export default AppointmentProfileHeader;
