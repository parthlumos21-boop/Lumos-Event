import React from 'react';
import { Bell, ChevronRight, Clock } from 'lucide-react';

const ReminderItem = ({ reminder, onClick }) => {
  const { title, description, notes, formattedDateTime, isOverdue } = reminder;
  const displayNotes = description || notes || '';

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
      className="group w-full p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-xs border border-transparent hover:border-[#DCECEC] bg-white/60 text-left"
    >
      {/* 1. Desktop & Tablet Layout (>= sm / >= 640px) - Strictly Preserved Horizontal Layout */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        {/* Left Icon */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D8EEEE] text-[#287985] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Bell size={18} className="shrink-0" />
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#287985] transition-colors">
              {title}
            </h4>
            {isOverdue && (
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 rounded-full">
                Overdue
              </span>
            )}
          </div>
          {displayNotes && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {displayNotes}
            </p>
          )}
        </div>

        {/* Right Date/Time & Chevron Arrow */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-xs font-mono font-medium text-gray-600 group-hover:text-gray-900 transition-colors whitespace-nowrap">
            {formattedDateTime}
          </span>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-[#287985] group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>

      {/* 2. Mobile Layout (< sm / < 640px) - Responsive Two-Row Overflow-Proof Layout */}
      <div className="sm:hidden flex flex-col gap-2">
        {/* Row 1: Bell Icon + Title, Badge, Notes + Chevron */}
        <div className="flex items-start justify-between gap-2.5">
          {/* Bell Icon */}
          <div className="w-8 h-8 rounded-xl bg-[#D8EEEE] text-[#287985] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
            <Bell size={15} className="shrink-0" />
          </div>

          {/* Title, Badge & Notes (natural wrapping, no clipping) */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#287985] transition-colors break-words leading-snug">
                {title}
              </h4>
              {isOverdue && (
                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-100 text-amber-800 rounded-full leading-none">
                  Overdue
                </span>
              )}
            </div>
            {displayNotes && (
              <p className="text-[11px] text-gray-500 break-words mt-1 leading-relaxed">
                {displayNotes}
              </p>
            )}
          </div>

          {/* Right Chevron */}
          <div className="shrink-0 self-center pl-1">
            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#287985] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Row 2: Clock Icon + Date/Time (aligned with text content) */}
        <div className="pl-10.5 flex items-center gap-1.5 text-[11px] font-mono text-gray-600">
          <Clock size={12} className="text-[#287985] shrink-0" />
          <span>{formattedDateTime}</span>
        </div>
      </div>
    </div>
  );
};

export default ReminderItem;
