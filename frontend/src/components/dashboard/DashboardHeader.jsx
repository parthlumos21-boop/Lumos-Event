import React from 'react';
import { PlusCircle, RotateCw } from 'lucide-react';
import clsx from 'clsx';

const DashboardHeader = ({
  title = 'Dashboard',
  onNewGuest,
  onRefresh,
  refreshing = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#31747d] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Dashboard Data"
            aria-label="Refresh Dashboard Data"
            className={clsx(
              'p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#31747d] hover:border-[#31747d]/40 hover:bg-gray-50 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#31747d]/30 cursor-pointer',
              refreshing && 'opacity-70 cursor-not-allowed'
            )}
          >
            <RotateCw
              size={18}
              className={clsx('transition-transform', refreshing && 'animate-spin text-[#31747d]')}
            />
          </button>
        )}

        {onNewGuest && (
          <button
            type="button"
            onClick={onNewGuest}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold text-sm transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-[#31747d]/30 cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>New Guest</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
