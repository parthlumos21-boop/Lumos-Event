import React, { useState } from 'react';

const TYPE_ICONS = {
  'Meeting Scheduled': 'fa-solid fa-calendar-days',
  'Follow-up Call': 'fa-solid fa-phone',
  'Client Visit': 'fa-solid fa-circle-check',
  'Email Communication': 'fa-solid fa-envelope',
  'Customer Interaction': 'fa-solid fa-users',
  'Remarks': 'fa-solid fa-comment-dots',
  'Other': 'fa-solid fa-bolt'
};

const TYPE_COLORS = {
  'Meeting Scheduled': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Follow-up Call': 'bg-amber-50 text-amber-600 border-amber-200',
  'Client Visit': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Email Communication': 'bg-sky-50 text-sky-600 border-sky-200',
  'Customer Interaction': 'bg-purple-50 text-purple-600 border-purple-200',
  'Remarks': 'bg-gray-100 text-gray-700 border-gray-200',
  'Other': 'bg-[#007788]/10 text-[#007788] border-[#007788]/20'
};

export const AppointmentActivitiesTab = ({
  activities = [],
  onOpenAddActivity,
  loading
}) => {
  const [filterType, setFilterType] = useState('ALL');

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    return act.activityType === filterType;
  });

  const uniqueTypes = ['ALL', ...new Set(activities.map((a) => a.activityType))];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Action & Filter Bar */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-[#007788]" />
            <span>Activity History</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Track consultation calls, client showroom visits, schedule adjustments and meeting remarks
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddActivity}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Add Update</span>
        </button>
      </div>

      {/* Filter Chips */}
      {activities.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-gray-400 font-semibold flex items-center gap-1.5 shrink-0">
            <i className="fa-solid fa-filter text-[11px]" /> Filter:
          </span>
          {uniqueTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === t
                  ? 'bg-[#007788] text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#007788]'
              }`}
            >
              {t} {t !== 'ALL' && `(${activities.filter((a) => a.activityType === t).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Timeline List */}
      {loading ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center text-gray-400 text-xs">
          Loading business activities from database...
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 text-gray-400 mx-auto flex items-center justify-center">
            <i className="fa-solid fa-calendar-days text-lg" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No activities recorded yet</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Log client calls, showroom visits, follow-up meetings or team remarks to maintain complete business history.
          </p>
          <button
            type="button"
            onClick={onOpenAddActivity}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007788] text-white rounded-full text-xs font-semibold hover:bg-[#006674] transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add First Update</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-100">
            {filteredActivities.map((act, index) => {
              const actDate = act.activityDateTime || act.activityDate ? new Date(act.activityDateTime || act.activityDate) : new Date(act.createdAt || Date.now());
              const iconClass = TYPE_ICONS[act.activityType] || 'fa-solid fa-bolt';
              const colorClass = TYPE_COLORS[act.activityType] || 'bg-gray-100 text-gray-700 border-gray-200';
              const actTitle = act.titleSummary || act.title || 'Activity update';
              const actDesc = act.detailedNotes || act.description;
              const authorName = act.createdByLog?.name || act.createdBy?.name || 'Staff User';
              const authorRole = act.createdByLog?.role || act.createdBy?.role || 'Staff';

              return (
                <div key={act._id || index} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#007788] flex items-center justify-center shadow-xs">
                    <span className="w-1.5 h-1.5 bg-[#007788] rounded-full" />
                  </div>

                  <div className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-4.5 space-y-2 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colorClass}`}>
                          <i className={`${iconClass} text-[10px]`} />
                          <span>{act.activityType}</span>
                        </span>
                        <h4 className="text-xs font-bold text-gray-900">{actTitle}</h4>
                      </div>

                      <span className="text-[11px] text-gray-400 font-mono">
                        {actDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {actDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {actDesc && (
                      <p className="text-xs text-gray-600 font-sans leading-relaxed whitespace-pre-line pl-0.5">
                        {actDesc}
                      </p>
                    )}

                    <div className="pt-1.5 border-t border-gray-200/50 flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-user text-[10px] text-gray-400" />
                        <span>Logged by <strong className="text-gray-700">{authorName}</strong> ({authorRole})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentActivitiesTab;
