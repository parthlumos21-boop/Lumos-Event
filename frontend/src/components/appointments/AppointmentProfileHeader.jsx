import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import HeaderMetricCard from '../common/HeaderMetricCard';

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
    <div className="bg-white border border-gray-200/90 rounded-3xl p-4 sm:p-6 shadow-xs font-sans">
      {/* 1. Mobile-Only Layout (< sm / < 640px) */}
      <div className="sm:hidden space-y-4">
        {/* Top Section: Avatar + Identity (Left) & Edit + More (Right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Circular Teal Avatar */}
            <div className="w-13 h-13 rounded-full bg-[#82c8cf] flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-[#82c8cf] border-2 border-white flex items-center justify-center">
                <i className="fa-solid fa-user text-white text-lg" />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0">
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight truncate">
                {clientName}
              </h1>
              <p className="text-xs text-gray-400 font-mono tracking-wider font-semibold">
                {srNo}
              </p>
            </div>
          </div>

          {/* Action Buttons: Compact Icon-only Edit + More Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEditAll}
              title="Edit Appointment"
              aria-label="Edit Appointment"
              className="w-9 h-9 flex items-center justify-center bg-[#007788] hover:bg-[#006674] text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Pencil size={15} className="text-white" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 h-9 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <i className={`fa-solid fa-rotate-right text-gray-400 ${loading ? 'fa-spin text-[#31747d]' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      window.print();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-print text-gray-400" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Statistics Section: 3 Centered Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <HeaderMetricCard
            icon="fa-solid fa-star"
            iconColor="text-amber-400"
            value={status}
            label="Status"
            minWidth="min-w-0"
          />
          <HeaderMetricCard
            icon="fa-solid fa-rotate"
            iconColor="text-[#31747d]"
            value={stats?.totalChanges || 0}
            label="Changes"
            minWidth="min-w-0"
          />
          <HeaderMetricCard
            icon="fa-solid fa-calendar-days"
            iconColor="text-[#31747d]"
            value={stats?.totalActivities || 0}
            label="Activities"
            minWidth="min-w-0"
          />
        </div>
      </div>

      {/* 2. Desktop & Tablet Layout (>= sm / >= 640px) */}
      <div className="hidden sm:flex flex-col lg:flex-row lg:items-center justify-between gap-5">
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

        {/* Center/Right: 3 Centered Metric Cards + Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto">
          <HeaderMetricCard
            icon="fa-solid fa-star"
            iconColor="text-amber-400"
            value={status}
            label="Status"
            minWidth="min-w-[85px] sm:min-w-[95px]"
          />
          <HeaderMetricCard
            icon="fa-solid fa-rotate"
            iconColor="text-[#31747d]"
            value={stats?.totalChanges || 0}
            label="Changes"
            minWidth="min-w-[85px] sm:min-w-[95px]"
          />
          <HeaderMetricCard
            icon="fa-solid fa-calendar-days"
            iconColor="text-[#31747d]"
            value={stats?.totalActivities || 0}
            label="Activities"
            minWidth="min-w-[85px] sm:min-w-[95px]"
          />

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
