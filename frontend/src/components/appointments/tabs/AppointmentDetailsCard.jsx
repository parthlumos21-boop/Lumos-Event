import React, { useState, useEffect } from 'react';

export const AppointmentDetailsCard = ({ appointment, onSave, saving }) => {
  const [editingField, setEditingField] = useState(null); // 'requirements' | 'remark' | 'all' | null
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [formData, setFormData] = useState({
    requirements: '',
    remark: ''
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        requirements: appointment.requirements || '',
        remark: appointment.remark || ''
      });
    }
  }, [appointment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (fieldToSave = null) => {
    const payload = {
      requirements: formData.requirements.trim(),
      remark: formData.remark.trim()
    };

    await onSave(payload);
    setEditingField(null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancelField = () => {
    if (appointment) {
      setFormData({
        requirements: appointment.requirements || '',
        remark: appointment.remark || ''
      });
    }
    setEditingField(null);
  };

  const isEditing = (field) => editingField === 'all' || editingField === field;

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans group relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Requirements & Remarks</h2>
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
              title="Edit all fields (or hover any field to edit directly)"
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

      {/* 2-Column Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-xs">
        {/* Requirements */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-list-check text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Client Requirements</span>
              {!isEditing('requirements') && (
                <button
                  type="button"
                  onClick={() => setEditingField('requirements')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('requirements') ? (
              <p
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('requirements')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('requirements'); }}
                className="text-gray-800 text-xs mt-1 leading-relaxed cursor-pointer hover:text-[#007788] whitespace-pre-line select-none"
                title="Click to edit"
              >
                {formData.requirements || 'No specific requirements logged.'}
              </p>
            ) : (
              <div className="mt-1 space-y-1.5">
                <textarea
                  autoFocus
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white leading-relaxed"
                  placeholder="Enter automation requirements..."
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSaveField('requirements')}
                    disabled={saving}
                    className="px-2.5 py-1 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelField}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remark */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-comment-dots text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Meeting Remarks</span>
              {!isEditing('remark') && (
                <button
                  type="button"
                  onClick={() => setEditingField('remark')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('remark') ? (
              <p
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('remark')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('remark'); }}
                className="text-gray-800 text-xs mt-1 leading-relaxed cursor-pointer hover:text-[#007788] whitespace-pre-line select-none"
                title="Click to edit"
              >
                {formData.remark || 'No remarks recorded.'}
              </p>
            ) : (
              <div className="mt-1 space-y-1.5">
                <textarea
                  autoFocus
                  rows={4}
                  value={formData.remark}
                  onChange={(e) => handleInputChange('remark', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white leading-relaxed"
                  placeholder="Enter remarks..."
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSaveField('remark')}
                    disabled={saving}
                    className="px-2.5 py-1 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelField}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsCard;
