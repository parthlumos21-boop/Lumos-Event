import React, { useState, useEffect } from 'react';
import { format12HourTime } from '../../../utils/timeFormat';

export const AppointmentScheduleCard = ({ appointment, onSave, saving }) => {
  const [editingField, setEditingField] = useState(null); // 'appointmentDate' | 'appointmentTime' | 'all' | null
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: ''
  });

  useEffect(() => {
    if (appointment) {
      const dStr = appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '';
      setFormData({
        appointmentDate: dStr,
        appointmentTime: appointment.appointmentTime || ''
      });
    }
  }, [appointment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (fieldToSave = null) => {
    const payload = {
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime.trim()
    };

    await onSave(payload);
    setEditingField(null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancelField = () => {
    if (appointment) {
      const dStr = appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '';
      setFormData({
        appointmentDate: dStr,
        appointmentTime: appointment.appointmentTime || ''
      });
    }
    setEditingField(null);
  };

  const isEditing = (field) => editingField === 'all' || editingField === field;

  const displayDate = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '-';

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans group relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Appointment Schedule</h2>
        </div>

        {/* Status indicator and overall Edit button */}
        <div className="flex items-center gap-2">
          {saveIndicator && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn">
              <i className="fa-solid fa-circle-check" /> Saved to MongoDB
            </span>
          )}

          {editingField !== 'all' ? (
            <button
              type="button"
              onClick={() => setEditingField('all')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#007788] hover:border-[#007788] text-xs font-semibold shadow-2xs transition-all opacity-80 hover:opacity-100 cursor-pointer"
              title="Edit schedule"
            >
              <i className="fa-solid fa-pen text-[11px]" />
              <span>Edit All</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSaveField('all')}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-check text-xs" />
                <span>Save All</span>
              </button>
              <button
                type="button"
                onClick={handleCancelField}
                disabled={saving}
                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Scheduled Date */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-calendar-days text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Meeting Date</span>
              {!isEditing('appointmentDate') && (
                <button
                  type="button"
                  onClick={() => setEditingField('appointmentDate')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit date"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('appointmentDate') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('appointmentDate')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('appointmentDate'); }}
                className="font-bold text-gray-900 text-sm block cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {displayDate}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="date"
                  autoFocus
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('appointmentDate')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Time */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-clock text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Meeting Time</span>
              {!isEditing('appointmentTime') && (
                <button
                  type="button"
                  onClick={() => setEditingField('appointmentTime')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit time"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('appointmentTime') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('appointmentTime')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('appointmentTime'); }}
                className="font-bold text-gray-900 text-sm block cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {format12HourTime(formData.appointmentTime)}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="time"
                  autoFocus
                  value={formData.appointmentTime}
                  onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('appointmentTime')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduleCard;
