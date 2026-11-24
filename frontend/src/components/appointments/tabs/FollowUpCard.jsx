import React from 'react';
import { Calendar, Clock, Bell, CheckCircle, Ban, Trash2, Edit3, ShieldCheck, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const STATUS_CONFIG = {
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    label: 'Pending'
  },
  Completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle,
    label: 'Completed'
  },
  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    icon: Ban,
    label: 'Cancelled'
  },
  Overdue: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: AlertTriangle,
    label: 'Overdue'
  }
};

export const FollowUpCard = ({
  followUp,
  onComplete,
  onCancel,
  onEdit,
  onDelete,
  canManage = true
}) => {
  const statusCfg = STATUS_CONFIG[followUp.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusCfg.icon;

  const dateObj = followUp.followUpDate ? new Date(followUp.followUpDate) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const reminderMinutes = followUp.reminder?.reminderBefore || 15;
  const reminderText = reminderMinutes >= 60
    ? `${reminderMinutes / 60}h before`
    : `${reminderMinutes}m before`;

  const isPendingOrOverdue = followUp.status === 'Pending' || followUp.status === 'Overdue';

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs hover:border-[#007788]/40 transition-all font-sans space-y-3">
      {/* Top Row: Date/Time + Status Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
          <Calendar size={14} className="text-[#007788] shrink-0" />
          <span className="font-mono">{formattedDate}</span>
          <span className="text-gray-300">•</span>
          <Clock size={13} className="text-gray-400 shrink-0" />
          <span className="font-mono">{followUp.followUpTime}</span>
        </div>

        {/* Status Pill */}
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0',
            statusCfg.bg,
            statusCfg.text,
            statusCfg.border
          )}
        >
          <StatusIcon size={12} />
          <span>{statusCfg.label}</span>
        </span>
      </div>

      {/* Meta Chips: Owner, Reminder & Creator */}
      <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
        {/* Appointment Owner */}
        {followUp.appointmentOwner?.name && (
          <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200/70 rounded-lg px-2 py-0.5 text-gray-700">
            <ShieldCheck size={11} className="text-[#007788]" />
            <span>Owner: <strong>{followUp.appointmentOwner.name}</strong></span>
          </span>
        )}

        {/* Reminder Pill */}
        {followUp.reminder?.enabled && (
          <span className="inline-flex items-center gap-1 bg-[#007788]/5 text-[#007788] border border-[#007788]/15 rounded-lg px-2 py-0.5 font-medium">
            <Bell size={11} />
            <span>Reminder {reminderText}</span>
            {followUp.reminder.isSent && (
              <span className="text-[10px] text-emerald-600 font-semibold">(Sent)</span>
            )}
          </span>
        )}

        {/* Creator if different */}
        {followUp.createdBy?.name && followUp.createdBy?.name !== followUp.appointmentOwner?.name && (
          <span className="text-gray-400">
            Created by {followUp.createdBy.name}
          </span>
        )}
      </div>

      {/* Notes Text */}
      {followUp.notes && (
        <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
          {followUp.notes}
        </div>
      )}

      {/* Action Buttons for Pending / Overdue */}
      {canManage && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {isPendingOrOverdue && (
              <>
                <button
                  type="button"
                  onClick={() => onComplete(followUp.followUpId)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                  title="Mark as Completed"
                >
                  <CheckCircle size={12} />
                  <span>Complete</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCancel(followUp.followUpId)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                  title="Cancel Follow-up"
                >
                  <Ban size={12} />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isPendingOrOverdue && (
              <button
                type="button"
                onClick={() => onEdit(followUp)}
                className="p-1.5 text-gray-400 hover:text-[#007788] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Edit Follow-up"
              >
                <Edit3 size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(followUp.followUpId)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Follow-up"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpCard;
