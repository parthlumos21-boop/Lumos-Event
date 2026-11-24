import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import ReminderItem from './ReminderItem';

const UpcomingReminders = ({
  reminders = [],
  pendingCount = 0,
  loading = false,
  onViewAll,
  onSelectReminder
}) => {
  return (
    <div className="bg-[#EFF8F8] border border-[#DCECEC] rounded-3xl p-5 sm:p-6 shadow-xs font-sans transition-all">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DCECEC]/70">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D8EEEE] text-[#287985] flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Upcoming Reminders
            </h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-[#D8EEEE] text-[#287985]">
                {pendingCount}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#287985] hover:text-[#1e5d66] transition-colors group cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Reminder List / Empty State / Loading State */}
      <div className="mt-3 space-y-2">
        {loading ? (
          <div className="py-6 flex items-center justify-center text-sm text-gray-500 font-medium">
            <div className="w-5 h-5 border-2 border-[#287985] border-t-transparent rounded-full animate-spin mr-2.5" />
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#D8EEEE]/60 text-[#287985] flex items-center justify-center mb-2">
              <Bell size={18} />
            </div>
            <p className="text-sm font-medium text-gray-600">No upcoming reminders</p>
            <p className="text-xs text-gray-400 mt-0.5">You're all caught up on follow-up tasks!</p>
          </div>
        ) : (
          reminders.slice(0, 3).map((reminder) => (
            <ReminderItem
              key={reminder.followUpId || `${reminder.appointmentId}-${reminder.followUpDate}`}
              reminder={reminder}
              onClick={() => onSelectReminder?.(reminder)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingReminders;
