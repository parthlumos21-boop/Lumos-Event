import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import HeaderMetricCard from '../common/HeaderMetricCard';
import { format12HourTime } from '../../utils/timeFormat';

export const AppointmentProfileHeader = ({
  appointment,
  stats,
  onEditAll,
  onRefresh,
  onAddFollowUp,
  onViewChanges,
  onViewActivities,
  loading
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const clientName = appointment?.clientName || 'Appointment Profile';
  const srNo = appointment?.srNo || 'APT-0001';
  const status = appointment?.status || 'Scheduled';

  const createdBy = appointment?.createdBy || {};
  const updatedBy = appointment?.updatedBy || {};

  const createdName = createdBy.name || 'Staff User';
  const createdInitials = (createdName.slice(0, 2) || 'ST').toUpperCase();

  const updatedName = updatedBy.name || createdName;
  const updatedInitials = (updatedName.slice(0, 2) || 'ST').toUpperCase();

  const createdAt = appointment?.createdAt ? new Date(appointment.createdAt) : new Date();
  const updatedAt = appointment?.updatedAt ? new Date(appointment.updatedAt) : createdAt;

  // Split date and time into separate lines for clean, non-overflowing display on mobile & tablet
  const createdDate = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const createdTime = format12HourTime(createdAt);

  const updatedDate = updatedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const updatedTime = format12HourTime(updatedAt);

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Rescheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Scheduled':
      default:
        return 'bg-blue-50 text-[#007788] border-blue-200/80';
    }
  };

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
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onAddFollowUp?.();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-calendar-plus text-[#007788]" />
                    <span>Add Follow-up</span>
                  </button>
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
            valueClassName="text-[10px] sm:text-xs font-bold font-mono tracking-tight text-gray-900 truncate leading-none"
          />
          <div onClick={onViewChanges} role="button" tabIndex={0} className="cursor-pointer">
            <HeaderMetricCard
              icon="fa-solid fa-rotate"
              iconColor="text-[#31747d]"
              value={stats?.totalChanges || 0}
              label="Changes"
              minWidth="min-w-0"
            />
          </div>
          <div onClick={onViewActivities} role="button" tabIndex={0} className="cursor-pointer">
            <HeaderMetricCard
              icon="fa-solid fa-calendar-days"
              iconColor="text-[#31747d]"
              value={stats?.totalActivities || 0}
              label="Activities"
              minWidth="min-w-0"
            />
          </div>
        </div>

        {/* Mobile Integrated Compact Record Information */}
        <div className="border-t border-gray-100 pt-3.5 mt-3.5">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            {/* Created By */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1c454b] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs">
                {createdInitials}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider leading-none">Created By</span>
                <span className="font-bold text-gray-900 text-[11px] block truncate mt-0.5">{createdName}</span>
              </div>
            </div>

            {/* Last Updated By */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#82c8cf] text-gray-800 flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs">
                {updatedInitials}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider leading-none">Last Updated By</span>
                <span className="font-bold text-gray-900 text-[11px] block truncate mt-0.5">{updatedName}</span>
              </div>
            </div>

            {/* Created On (Date on row 1, Time on row 2) */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gray-50 text-[#007788] flex items-center justify-center shrink-0 border border-gray-100">
                <i className="fa-solid fa-calendar-days text-[11px]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider leading-none">Created On</span>
                <div className="mt-0.5 leading-tight font-mono">
                  <span className="font-semibold text-gray-800 text-[10.5px] block truncate">{createdDate}</span>
                  <span className="text-[9.5px] text-gray-500 block truncate">{createdTime}</span>
                </div>
              </div>
            </div>

            {/* Last Updated (Date on row 1, Time on row 2) */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gray-50 text-[#007788] flex items-center justify-center shrink-0 border border-gray-100">
                <i className="fa-solid fa-clock-rotate-left text-[11px]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wider leading-none">Last Updated</span>
                <div className="mt-0.5 leading-tight font-mono">
                  <span className="font-semibold text-gray-800 text-[10.5px] block truncate">{updatedDate}</span>
                  <span className="text-[9.5px] text-gray-500 block truncate">{updatedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop & Tablet Layout (>= sm / >= 640px) */}
      <div className="hidden sm:block space-y-4 sm:space-y-5">
        {/* Primary Row: Left Section (Identity) & Right Section (Counters + Actions) */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Avatar + Identity (Name, ID, Status Badge) */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            {/* Circular Teal Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#82c8cf] flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#82c8cf] border-2 border-white flex items-center justify-center">
                <i className="fa-solid fa-user text-white text-2xl" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate leading-tight">
                {clientName}
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-gray-500 font-semibold tracking-wider">
                  {srNo}
                </span>
                <span className="text-gray-300 font-bold">•</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(status)}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Right: 2x2 Grid on Tablet (2 rows, 2 columns), 1 row on Laptop & Desktop */}
          <div className="grid grid-cols-2 gap-2 shrink-0 ml-auto w-auto md:flex md:items-center md:gap-2 lg:gap-2.5">
            {/* Changes Counter Button */}
            <button
              type="button"
              onClick={onViewChanges}
              title="View Changes History"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-gray-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:border-gray-300 whitespace-nowrap"
            >
              <i className="fa-solid fa-rotate text-[#31747d] text-xs" />
              <span>{stats?.totalChanges || 0} Changes</span>
            </button>

            {/* Activities Counter Button */}
            <button
              type="button"
              onClick={onViewActivities}
              title="View Activities"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-gray-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:border-gray-300 whitespace-nowrap"
            >
              <i className="fa-solid fa-calendar-days text-[#31747d] text-xs" />
              <span>{stats?.totalActivities || 0} Activities</span>
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={onEditAll}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-pen text-xs" />
              <span>Edit</span>
            </button>

            {/* More Dropdown */}
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>More</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-gray-400" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onAddFollowUp?.();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-calendar-plus text-[#007788]" />
                    <span>Add Follow-up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDropdownOpen(false);
                      onRefresh();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 cursor-pointer"
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

        {/* Secondary Row: Integrated Compact Record Information */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
            {/* Created By */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1c454b] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                {createdInitials}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Created By</span>
                <span className="font-bold text-gray-900 text-xs block truncate mt-0.5">{createdName}</span>
              </div>
            </div>

            {/* Last Updated By */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#82c8cf] text-gray-800 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
                {updatedInitials}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Last Updated By</span>
                <span className="font-bold text-gray-900 text-xs block truncate mt-0.5">{updatedName}</span>
              </div>
            </div>

            {/* Created On (2 rows: Date on row 1, Time on row 2) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-50 text-[#007788] flex items-center justify-center shrink-0 border border-gray-100">
                <i className="fa-solid fa-calendar-days text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Created On</span>
                <div className="mt-0.5 leading-tight font-mono">
                  <span className="font-semibold text-gray-800 text-xs block truncate">{createdDate}</span>
                  <span className="text-[10px] text-gray-500 block truncate">{createdTime}</span>
                </div>
              </div>
            </div>

            {/* Last Updated (2 rows: Date on row 1, Time on row 2) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-50 text-[#007788] flex items-center justify-center shrink-0 border border-gray-100">
                <i className="fa-solid fa-clock-rotate-left text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Last Updated</span>
                <div className="mt-0.5 leading-tight font-mono">
                  <span className="font-semibold text-gray-800 text-xs block truncate">{updatedDate}</span>
                  <span className="text-[10px] text-gray-500 block truncate">{updatedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentProfileHeader;
