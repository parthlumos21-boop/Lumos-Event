import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../common/SearchableSelect';

const REFERENCE_OPTIONS = [
  'Architect',
  'Interior Designer',
  'Builder',
  'Automation Consultant',
  'Direct Client',
  'Other'
];

const STATUS_OPTIONS = [
  'Scheduled',
  'Pending',
  'Completed',
  'Cancelled',
  'Rescheduled'
];

export const AppointmentInfoCard = ({ appointment, onSave, saving }) => {
  const [editingField, setEditingField] = useState(null); // 'clientName' | 'location' | 'contact' | 'reference' | 'referenceName' | 'internalReference' | 'status' | 'all' | null
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    location: '',
    contact: '',
    reference: 'Direct Client',
    referenceName: '',
    internalReference: '',
    status: 'Scheduled'
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName || '',
        location: appointment.location || '',
        contact: appointment.contact || '',
        reference: appointment.reference || 'Direct Client',
        referenceName: appointment.referenceName || '',
        internalReference: appointment.internalReference || '',
        status: appointment.status || 'Scheduled'
      });
    }
  }, [appointment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (fieldToSave = null) => {
    const payload = {
      ...formData,
      clientName: formData.clientName.trim(),
      location: formData.location.trim(),
      contact: formData.contact.trim(),
      reference: formData.reference || 'Direct Client',
      referenceName: formData.reference !== 'Direct Client' ? (formData.referenceName || '').trim() : '',
      internalReference: (formData.internalReference || '').trim()
    };

    await onSave(payload);
    setEditingField(null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancelField = () => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName || '',
        location: appointment.location || '',
        contact: appointment.contact || '',
        reference: appointment.reference || 'Direct Client',
        referenceName: appointment.referenceName || '',
        internalReference: appointment.internalReference || '',
        status: appointment.status || 'Scheduled'
      });
    }
    setEditingField(null);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveField(field);
    } else if (e.key === 'Escape') {
      handleCancelField();
    }
  };

  const isEditing = (field) => editingField === 'all' || editingField === field;

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans group relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Appointment Information</h2>
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
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                Press <strong>Enter</strong> to save
              </span>
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

      {/* 2-Column Fields Grid with Per-Field Hover Edit & Enter-Key Auto-Save */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-xs">
        {/* Client Name */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-user text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Client Name</span>
              {!isEditing('clientName') && (
                <button
                  type="button"
                  onClick={() => setEditingField('clientName')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('clientName') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('clientName')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('clientName'); }}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {formData.clientName || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'clientName')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Client Name"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('clientName')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Save (Enter)"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Cancel (Esc)"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-location-dot text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Location / Site</span>
              {!isEditing('location') && (
                <button
                  type="button"
                  onClick={() => setEditingField('location')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('location') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('location')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('location'); }}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {formData.location || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'location')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Location"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('location')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Save (Enter)"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Cancel (Esc)"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-phone text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Contact Number</span>
              {!isEditing('contact') && (
                <button
                  type="button"
                  onClick={() => setEditingField('contact')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('contact') ? (
              <a
                href={`tel:${formData.contact}`}
                style={{ touchAction: 'manipulation' }}
                className="font-bold text-gray-900 text-sm block truncate hover:text-[#007788]"
                title="Click to call or edit"
              >
                +91 {formData.contact || '-'}
              </a>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'contact')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="10-digit contact number"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('contact')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Save (Enter)"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Cancel (Esc)"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reference */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-compass-drafting text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Reference</span>
              {!isEditing('reference') && (
                <button
                  type="button"
                  onClick={() => setEditingField('reference')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('reference') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('reference')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('reference'); }}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {formData.reference || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <select
                  autoFocus
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                >
                  {REFERENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSaveField('reference')}
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

        {/* Reference Name (conditional when Reference !== Direct Client) */}
        {formData.reference !== 'Direct Client' && (
          <div className="flex items-start gap-3 group/field relative">
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
              <i className="fa-solid fa-id-card text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400 font-medium block">Reference Name ({formData.reference})</span>
                {!isEditing('referenceName') && (
                  <button
                    type="button"
                    onClick={() => setEditingField('referenceName')}
                    style={{ touchAction: 'manipulation' }}
                    className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                    title="Click to edit (Press Enter to save)"
                  >
                    <i className="fa-solid fa-pen text-[10px]" />
                  </button>
                )}
              </div>

              {!isEditing('referenceName') ? (
                <span
                  role="button"
                  tabIndex={0}
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => setEditingField('referenceName')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('referenceName'); }}
                  className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788] select-none"
                  title="Click to edit"
                >
                  {formData.referenceName || '-'}
                </span>
              ) : (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="text"
                    autoFocus
                    value={formData.referenceName}
                    onChange={(e) => handleInputChange('referenceName', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'referenceName')}
                    className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                    placeholder={`Enter ${formData.reference.toLowerCase()} name`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveField('referenceName')}
                    disabled={saving}
                    className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                    title="Save (Enter)"
                  >
                    <i className="fa-solid fa-check text-[11px]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelField}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                    title="Cancel (Esc)"
                  >
                    <i className="fa-solid fa-xmark text-[11px]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Internal Reference */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-handshake text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Internal Reference</span>
              {!isEditing('internalReference') && (
                <button
                  type="button"
                  onClick={() => setEditingField('internalReference')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('internalReference') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('internalReference')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('internalReference'); }}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788] select-none"
                title="Click to edit"
              >
                {formData.internalReference || formData.reference || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.internalReference}
                  onChange={(e) => handleInputChange('internalReference', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'internalReference')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Internal team reference member"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('internalReference')}
                  disabled={saving}
                  className="p-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs cursor-pointer shrink-0"
                  title="Save (Enter)"
                >
                  <i className="fa-solid fa-check text-[11px]" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelField}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs cursor-pointer shrink-0"
                  title="Cancel (Esc)"
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-tag text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Appointment Status</span>
              {!isEditing('status') && (
                <button
                  type="button"
                  onClick={() => setEditingField('status')}
                  style={{ touchAction: 'manipulation' }}
                  className="opacity-75 sm:opacity-0 sm:group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer p-1 -m-1"
                  title="Click to edit"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('status') ? (
              <span
                role="button"
                tabIndex={0}
                style={{ touchAction: 'manipulation' }}
                onClick={() => setEditingField('status')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditingField('status'); }}
                className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#007788]/10 text-[#007788] border border-[#007788]/20 cursor-pointer hover:bg-[#007788]/20 transition-colors select-none"
                title="Click to edit"
              >
                {formData.status || 'Scheduled'}
              </span>
            ) : (
              <div className="mt-1 space-y-1.5">
                <SearchableSelect
                  options={STATUS_OPTIONS.map((st) => ({ label: st, value: st }))}
                  value={formData.status}
                  onChange={(val) => handleInputChange('status', val)}
                  placeholder="Select or search status..."
                  searchPlaceholder="Search status (e.g. Pending, Completed)..."
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveField('status')}
                    disabled={saving}
                    className="px-2.5 py-1 bg-[#007788] hover:bg-[#006674] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelField}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer"
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

export default AppointmentInfoCard;
