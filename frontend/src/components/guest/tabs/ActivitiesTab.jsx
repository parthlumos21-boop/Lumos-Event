import React, { useState } from 'react';

const TYPE_ICONS = {
  'Follow-up Call': 'fa-solid fa-phone',
  'Meeting Scheduled': 'fa-solid fa-calendar-days',
  'Guest Visit': 'fa-solid fa-circle-check',
  'Email Communication': 'fa-solid fa-envelope',
  'Customer Interaction': 'fa-solid fa-users',
  'Remarks': 'fa-solid fa-comment-dots',
  'Other': 'fa-solid fa-bolt'
};

const TYPE_COLORS = {
  'Follow-up Call': 'bg-amber-50 text-amber-600 border-amber-200',
  'Meeting Scheduled': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'Guest Visit': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'Email Communication': 'bg-sky-50 text-sky-600 border-sky-200',
  'Customer Interaction': 'bg-purple-50 text-purple-600 border-purple-200',
  'Remarks': 'bg-gray-100 text-gray-700 border-gray-200',
  'Other': 'bg-[#007788]/10 text-[#007788] border-[#007788]/20'
};

const ActivitiesTab = ({ activities = [], onOpenAddActivity, loading }) => {
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
            <i className="fa-solid fa-bolt text-[#007788]" />
            <span>Business Activities & Interactions</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Track meetings, follow-up calls, visits, emails and customer communications
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddActivity}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Log New Activity</span>
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
            <span>Log First Activity</span>
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 sm:ml-6 space-y-6 pb-2">
          {filteredActivities.map((act) => {
            const iconClass = TYPE_ICONS[act.activityType] || 'fa-solid fa-bolt';
            const badgeColor = TYPE_COLORS[act.activityType] || TYPE_COLORS['Other'];
            const actDate = act.activityDate ? new Date(act.activityDate) : new Date(act.createdAt);

            return (
              <div key={act._id} className="relative pl-6 sm:pl-8 group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 group-hover:border-[#007788] flex items-center justify-center text-gray-600 group-hover:text-[#007788] shadow-2xs transition-colors">
                  <i className={`${iconClass} text-xs`} />
                </div>

                {/* Activity Card */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#007788]/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                        {act.activityType}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{act.title}</h4>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                      <i className="fa-solid fa-clock text-[10px]" />
                      <span>
                        {actDate.toLocaleDateString()} at{' '}
                        {actDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {act.description && (
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap">
                      {act.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">Logged by:</span>
                      <span className="font-semibold text-gray-800">{act.createdBy?.name || 'Staff User'}</span>
                      <span className="text-gray-400">({act.createdBy?.role || 'employee'})</span>
                    </span>

                    {act.createdBy?.email && (
                      <span className="font-mono text-gray-400 hidden sm:inline">{act.createdBy.email}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;
