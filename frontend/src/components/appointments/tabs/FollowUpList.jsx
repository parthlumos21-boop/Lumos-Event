import React, { useState, useMemo } from 'react';
import FollowUpCard from './FollowUpCard';
import { Calendar, Plus, Clock, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const FollowUpList = ({
  followUps = [],
  onAddFollowUp,
  onComplete,
  onCancel,
  onEdit,
  onDelete,
  canManage = true
}) => {
  const [filter, setFilter] = useState('active'); // 'active' | 'all' | 'completed' | 'cancelled'

  const counts = useMemo(() => {
    let pending = 0;
    let overdue = 0;
    let completed = 0;
    let cancelled = 0;

    followUps.forEach((f) => {
      if (f.status === 'Pending') pending++;
      else if (f.status === 'Overdue') overdue++;
      else if (f.status === 'Completed') completed++;
      else if (f.status === 'Cancelled') cancelled++;
    });

    return {
      all: followUps.length,
      active: pending + overdue,
      pending,
      overdue,
      completed,
      cancelled
    };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    if (filter === 'active') {
      return followUps.filter((f) => f.status === 'Pending' || f.status === 'Overdue');
    }
    if (filter === 'completed') {
      return followUps.filter((f) => f.status === 'Completed');
    }
    if (filter === 'cancelled') {
      return followUps.filter((f) => f.status === 'Cancelled');
    }
    return followUps;
  }, [followUps, filter]);

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#007788]/10 text-[#007788] flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Follow-ups & Reminders
            </h3>
            <p className="text-[11px] text-gray-500">
              {counts.active} active • {counts.completed} completed
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onAddFollowUp}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={clsx(
            'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            filter === 'active'
              ? 'bg-[#007788] text-white shadow-2xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <Clock size={12} />
          <span>Pending & Overdue</span>
          <span className={clsx('px-1.5 py-0.2 rounded-full text-[10px] font-mono', filter === 'active' ? 'bg-white/20' : 'bg-gray-100')}>
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={clsx(
            'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            filter === 'completed'
              ? 'bg-[#007788] text-white shadow-2xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <CheckCircle size={12} />
          <span>Completed</span>
          <span className={clsx('px-1.5 py-0.2 rounded-full text-[10px] font-mono', filter === 'completed' ? 'bg-white/20' : 'bg-gray-100')}>
            {counts.completed}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
            filter === 'all'
              ? 'bg-[#007788] text-white shadow-2xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <span>All</span>
          <span className={clsx('px-1.5 py-0.2 rounded-full text-[10px] font-mono', filter === 'all' ? 'bg-white/20' : 'bg-gray-100')}>
            {counts.all}
          </span>
        </button>

        {counts.cancelled > 0 && (
          <button
            type="button"
            onClick={() => setFilter('cancelled')}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
              filter === 'cancelled'
                ? 'bg-[#007788] text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <Ban size={12} />
            <span>Cancelled</span>
            <span className={clsx('px-1.5 py-0.2 rounded-full text-[10px] font-mono', filter === 'cancelled' ? 'bg-white/20' : 'bg-gray-100')}>
              {counts.cancelled}
            </span>
          </button>
        )}
      </div>

      {/* Cards List or Empty State */}
      {filteredFollowUps.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-8 text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <Calendar size={22} />
          </div>
          <h4 className="text-sm font-bold text-gray-800">
            {filter === 'active' ? 'No pending follow-ups' : 'No follow-up records found'}
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filter === 'active'
              ? 'All follow-up actions for this appointment have been handled.'
              : 'Keep track of client interactions and automated reminders by scheduling a follow-up.'}
          </p>
          <button
            type="button"
            onClick={onAddFollowUp}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredFollowUps.map((flw) => (
            <FollowUpCard
              key={flw.followUpId}
              followUp={flw}
              onComplete={onComplete}
              onCancel={onCancel}
              onEdit={onEdit}
              onDelete={onDelete}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUpList;
