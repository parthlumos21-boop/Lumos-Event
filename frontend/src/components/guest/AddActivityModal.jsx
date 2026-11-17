import React, { useState } from 'react';
import SearchableSelect from '../common/SearchableSelect';

const ACTIVITY_TYPES = [
  'Guest Visit',
  'Follow-up Call',
  'Meeting Scheduled',
  'Email Communication',
  'Customer Interaction',
  'Remarks',
  'Other'
];

const AddActivityModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const [activityType, setActivityType] = useState('Follow-up Call');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Activity title is required.');
      return;
    }
    setError('');
    onSubmit({
      activityType,
      title: title.trim(),
      description: description.trim(),
      activityDate: new Date(activityDate)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#007788]/10 text-[#007788] flex items-center justify-center">
              <i className="fa-solid fa-calendar-days text-sm" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Log Business Activity</h3>
              <p className="text-xs text-gray-500">Record a call, visit, meeting or remarks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-xs" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={ACTIVITY_TYPES}
              value={activityType}
              onChange={setActivityType}
              placeholder="Select activity type"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Title / Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discussed lighting automation for villa"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Activity Date & Time
            </label>
            <input
              type="datetime-local"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Notes & Discussion Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter interaction remarks, customer feedback, next steps..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <i className="fa-solid fa-circle-check text-xs" />
              <span>{submitting ? 'Saving...' : 'Save Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal;
