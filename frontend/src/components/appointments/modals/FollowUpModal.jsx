import React, { useState, useEffect } from 'react';
import { Calendar, Bell, AlertCircle, X, CheckCircle } from 'lucide-react';

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes before', unit: 'minutes' },
  { value: 15, label: '15 minutes before (Recommended)', unit: 'minutes' },
  { value: 30, label: '30 minutes before', unit: 'minutes' },
  { value: 60, label: '1 hour before', unit: 'hours' },
  { value: 120, label: '2 hours before', unit: 'hours' },
  { value: 1440, label: '1 day before', unit: 'days' }
];

export const FollowUpModal = ({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  appointment,
  initialData = null
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderBefore, setReminderBefore] = useState(15);
  const [error, setError] = useState('');

  // Prefill or reset whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.followUpDate ? new Date(initialData.followUpDate).toISOString().split('T')[0] : todayStr);
        setTime(initialData.followUpTime || '11:00');
        setNotes(initialData.notes || '');
        setReminderEnabled(initialData.reminder?.enabled !== false);
        setReminderBefore(initialData.reminder?.reminderBefore || 15);
      } else {
        setDate(todayStr);
        // Default time: next hour
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hh}:${mm}`);
        setNotes('');
        setReminderEnabled(true);
        setReminderBefore(15);
      }
      setError('');
    }
  }, [isOpen, initialData, todayStr]);

  if (!isOpen) return null;

  const apptOwnerName = appointment?.createdBy?.name || appointment?.internalReference || 'Staff User';
  const apptId = appointment?.srNo || 'APT-1009';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Follow-up Date is required.');
      return;
    }
    if (!time) {
      setError('Follow-up Time is required.');
      return;
    }

    // Check if scheduled in the past
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(selectedDateTime.getTime())) {
      setError('Invalid Date or Time entered.');
      return;
    }

    const selectedOption = REMINDER_OPTIONS.find((opt) => opt.value === Number(reminderBefore)) || REMINDER_OPTIONS[1];

    onSubmit({
      followUpDate: date,
      followUpTime: time,
      notes: notes.trim(),
      reminder: {
        enabled: reminderEnabled,
        reminderBefore: Number(reminderBefore),
        reminderUnit: selectedOption.unit
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* B. Header Section */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007788]/10 text-[#007788] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {initialData ? 'Edit Follow-up' : 'Add Follow-up'}
              </h3>
              <p className="text-xs text-gray-500">
                Schedule a follow-up for this appointment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="follow-up-modal-form" onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* C. Appointment Information Panel */}
          <div className="p-3.5 bg-gray-50/80 border border-gray-200/60 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Appointment Owner
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5">
                {apptOwnerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Appointment ID
              </p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-800 mt-0.5">
                {apptId}
              </p>
            </div>
          </div>

          {/* D. Follow-up Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Follow-up Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
              />
            </div>

            {/* Follow-up Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Follow-up Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* E. Follow-up Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Follow-up Notes
            </label>
            <div className="relative">
              <textarea
                rows={3}
                maxLength={5000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter discussion topics, action items, or remarks..."
                className="w-full px-3.5 py-2.5 pb-6 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all resize-y"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-mono pointer-events-none">
                {notes.length} / 5000
              </span>
            </div>
          </div>

          {/* F. Automated Reminder Section (Open Layout) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className={reminderEnabled ? 'text-[#007788]' : 'text-gray-400'} />
                <span className="text-xs sm:text-sm font-bold text-gray-800">Automated Reminder</span>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007788]" />
              </label>
            </div>

            {reminderEnabled && (
              <div className="space-y-1.5 pl-6">
                <label className="block text-xs font-semibold text-gray-600">
                  Reminder Interval
                </label>
                <select
                  value={reminderBefore}
                  onChange={(e) => setReminderBefore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007788] cursor-pointer font-medium"
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  Reminder notification will be sent to the appointment owner.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* G. Footer Section */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="follow-up-modal-form"
            disabled={submitting}
            className="px-5 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>Save Follow-up</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
