import React from 'react';
import clsx from 'clsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'fa-solid fa-house' },
  { id: 'details', label: 'Guest Details', icon: 'fa-solid fa-id-badge' },
  { id: 'activities', label: 'Activities', icon: 'fa-solid fa-bolt', countKey: 'totalActivities' },
  { id: 'ownership', label: 'Ownership', icon: 'fa-solid fa-shield-halved' }
];

const GuestProfileTabs = ({ activeTab, onChangeTab, stats }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-sans py-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = tab.countKey ? stats?.[tab.countKey] : null;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none shrink-0',
              isActive
                ? 'bg-[#007788] text-white shadow-xs'
                : 'bg-white hover:bg-gray-100/80 text-gray-600 border border-gray-200/80'
            )}
          >
            <i className={`${tab.icon} ${isActive ? 'text-white' : 'text-gray-400'}`} />
            <span>{tab.label}</span>
            {count !== null && count !== undefined && count > 0 && (
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold leading-none',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GuestProfileTabs;
