import React, { useState, useEffect } from 'react';

const RELATIONSHIP_OPTIONS = [
  'Architect',
  'Interior Designer',
  'Builder / Developer',
  'Electrical Consultant / Contractor',
  'System Integrator',
  'Existing Customer',
  'Potential Customer',
  'Business Partner / Vendor',
  'Friend & Family',
  'Other'
];

const GuestInformationCard = ({ guest, onSave, saving }) => {
  const [editingField, setEditingField] = useState(null); // 'name' | 'email' | 'phone' | 'relationship' | 'company' | 'followUp' | 'all' | null
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'Existing Customer',
    company: '',
    followUp: 'No',
    interests: []
  });

  // Sync with guest prop
  useEffect(() => {
    if (guest) {
      const g = guest.guest || {};
      const followUp = guest.followUp || {};
      setFormData({
        name: g.name || '',
        email: g.email || '',
        phone: g.phone || '',
        relationship: guest.relationship || 'Existing Customer',
        company: g.company || '',
        followUp: followUp.required ? 'Yes' : 'No',
        interests: Array.isArray(guest.interests)
          ? guest.interests.map((i) => (i === 'Security' ? 'Security & Surveillance' : i))
          : []
      });
    }
  }, [guest]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (fieldToSave = null) => {
    const payload = {
      guest: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        company: formData.company.trim()
      },
      relationship: formData.relationship,
      followUp: {
        required: formData.followUp.toLowerCase() === 'yes',
        preferredMethod: guest?.followUp?.preferredMethod || 'Phone'
      },
      interests: formData.interests,
      remarks: fieldToSave
        ? `Field '${fieldToSave}' updated from Guest Information card`
        : 'Inline updated from Guest Information card'
    };

    await onSave(payload);
    setEditingField(null);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancelField = () => {
    if (guest) {
      const g = guest.guest || {};
      const followUp = guest.followUp || {};
      setFormData({
        name: g.name || '',
        email: g.email || '',
        phone: g.phone || '',
        relationship: guest.relationship || 'Existing Customer',
        company: g.company || '',
        followUp: followUp.required ? 'Yes' : 'No',
        interests: Array.isArray(guest.interests)
          ? guest.interests.map((i) => (i === 'Security' ? 'Security & Surveillance' : i))
          : []
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
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Guest Information</h2>
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
        {/* Full Name */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-user text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Full Name</span>
              {!isEditing('name') && (
                <button
                  type="button"
                  onClick={() => setEditingField('name')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('name') ? (
              <span
                onClick={() => setEditingField('name')}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.name || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'name')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Full Name"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('name')}
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

        {/* Email Address */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-envelope text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Email Address</span>
              {!isEditing('email') && (
                <button
                  type="button"
                  onClick={() => setEditingField('email')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('email') ? (
              <span
                onClick={() => setEditingField('email')}
                className="font-bold text-gray-900 text-sm block break-all cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.email || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="email"
                  autoFocus
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Email Address"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('email')}
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

        {/* Mobile Number */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-phone text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Mobile Number</span>
              {!isEditing('phone') && (
                <button
                  type="button"
                  onClick={() => setEditingField('phone')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('phone') ? (
              <span
                onClick={() => setEditingField('phone')}
                className="font-bold text-gray-900 text-sm font-mono block cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.phone ? `+91 ${formData.phone}` : '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="tel"
                  autoFocus
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'phone')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white font-mono"
                  placeholder="Mobile Number"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('phone')}
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

        {/* Relationship */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-handshake text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Relationship</span>
              {!isEditing('relationship') && (
                <button
                  type="button"
                  onClick={() => setEditingField('relationship')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('relationship') ? (
              <span
                onClick={() => setEditingField('relationship')}
                className="font-bold text-gray-900 text-sm block cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.relationship || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <select
                  autoFocus
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'relationship')}
                  className="w-full px-2 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white cursor-pointer"
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSaveField('relationship')}
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

        {/* Company */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-building text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Company</span>
              {!isEditing('company') && (
                <button
                  type="button"
                  onClick={() => setEditingField('company')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('company') ? (
              <span
                onClick={() => setEditingField('company')}
                className="font-bold text-gray-900 text-sm block truncate cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.company || '-'}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  autoFocus
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'company')}
                  className="w-full px-2.5 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                  placeholder="Company Name"
                />
                <button
                  type="button"
                  onClick={() => handleSaveField('company')}
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

        {/* Follow Up */}
        <div className="flex items-start gap-3 group/field relative">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-bell text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium block">Follow Up</span>
              {!isEditing('followUp') && (
                <button
                  type="button"
                  onClick={() => setEditingField('followUp')}
                  className="opacity-0 group-hover/field:opacity-100 transition-opacity text-gray-400 hover:text-[#007788] cursor-pointer"
                  title="Click to edit (Press Enter to save)"
                >
                  <i className="fa-solid fa-pen text-[10px]" />
                </button>
              )}
            </div>

            {!isEditing('followUp') ? (
              <span
                onClick={() => setEditingField('followUp')}
                className="font-bold text-gray-900 text-sm block cursor-pointer hover:text-[#007788]"
                title="Click to edit"
              >
                {formData.followUp}
              </span>
            ) : (
              <div className="flex items-center gap-1 mt-1">
                <select
                  autoFocus
                  value={formData.followUp}
                  onChange={(e) => handleInputChange('followUp', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'followUp')}
                  className="w-full px-2 py-1 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleSaveField('followUp')}
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
      </div>

      {/* Interests Chips */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <i className="fa-solid fa-tag text-[#007788] text-xs" />
          <span className="text-xs font-bold text-gray-700">Interests</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.interests.length > 0 ? (
            formData.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-[#e2f3f5] text-[#007788] rounded-full text-xs font-bold border border-[#c4e8ec]"
              >
                {interest}
              </span>
            ))
          ) : (
            <>
              <span className="px-3.5 py-1.5 bg-[#e2f3f5] text-[#007788] rounded-full text-xs font-bold border border-[#c4e8ec]">
                Lighting & Dimming
              </span>
              <span className="px-3.5 py-1.5 bg-[#e2f3f5] text-[#007788] rounded-full text-xs font-bold border border-[#c4e8ec]">
                Home Automation
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestInformationCard;
