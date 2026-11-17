import React from 'react';

const formatActivityTime = (dateStr) => {
  if (!dateStr) return 'Today, 11:20 AM';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${timeStr}`;
};

const RecentActivitiesCard = ({ activities = [], onNavigateActivities }) => {
  // If activities exist in MongoDB, use the latest 3, otherwise provide default event activities
  const displayActivities =
    activities && activities.length > 0
      ? activities.slice(0, 3)
      : [
          {
            _id: 'default-1',
            activityType: 'Guest Visit',
            title: 'Guest visited the event',
            activityDate: new Date(),
            icon: 'fa-solid fa-circle-check',
            bg: 'bg-emerald-500 text-white'
          },
          {
            _id: 'default-2',
            activityType: 'Follow-up Call',
            title: 'Follow-up call completed',
            activityDate: new Date(Date.now() - 35 * 60 * 1000),
            icon: 'fa-solid fa-phone',
            bg: 'bg-sky-500 text-white'
          },
          {
            _id: 'default-3',
            activityType: 'Meeting Scheduled',
            title: 'Meeting scheduled',
            activityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            icon: 'fa-solid fa-calendar-days',
            bg: 'bg-purple-500 text-white'
          }
        ];

  const getIconProps = (type) => {
    switch (type) {
      case 'Guest Visit':
        return { icon: 'fa-solid fa-circle-check', bg: 'bg-emerald-500 text-white' };
      case 'Follow-up Call':
        return { icon: 'fa-solid fa-phone', bg: 'bg-sky-500 text-white' };
      case 'Meeting Scheduled':
        return { icon: 'fa-solid fa-calendar-days', bg: 'bg-purple-500 text-white' };
      case 'Email Communication':
        return { icon: 'fa-solid fa-envelope', bg: 'bg-indigo-500 text-white' };
      default:
        return { icon: 'fa-solid fa-circle-check', bg: 'bg-[#007788] text-white' };
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent Activities</h2>
        </div>

        <button
          type="button"
          onClick={onNavigateActivities}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007788] hover:text-[#005f6d] cursor-pointer"
        >
          <span>View All</span>
          <i className="fa-solid fa-arrow-right text-[11px]" />
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {displayActivities.map((act) => {
          const style = act.icon ? act : getIconProps(act.activityType);
          return (
            <div key={act._id} className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${style.bg}`}
              >
                <i className={`${style.icon} text-sm`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{act.title}</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {formatActivityTime(act.activityDate)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivitiesCard;
