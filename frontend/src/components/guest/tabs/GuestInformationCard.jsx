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
  const [isEditing, setIsEditing] = useState(false);
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
        interests: Array.isArray(guest.interests) ? guest.interests : []
      });
    }
  }, [guest]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
      remarks: 'Inline updated from Guest Information card'
    };

    await onSave(payload);
    setIsEditing(false);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 3000);
  };

  const handleCancel = () => {
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
        interests: Array.isArray(guest.interests) ? guest.interests : []
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans group relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Guest Information</h2>
        </div>

        {/* Hover-revealed Edit Pencil button */}
        <div className="flex items-center gap-2">
          {saveIndicator && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <i className="fa-solid fa-circle-check" /> Saved to MongoDB
            </span>
          )}

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#007788] hover:border-[#007788] text-xs font-semibold shadow-2xs transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
              title="Click to edit (Press Enter to save)"
            >
              <i className="fa-solid fa-pen text-[11px]" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                Press <strong>Enter</strong> to save
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-check text-xs" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
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
        {/* Full Name */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-user text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Full Name</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm block">
                {formData.name || '-'}
              </span>
            ) : (
              <input
                type="text"
                autoFocus
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                placeholder="Full Name"
              />
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-envelope text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Email Address</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm block break-all">
                {formData.email || '-'}
              </span>
            ) : (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                placeholder="Email Address"
              />
            )}
          </div>
        </div>

        {/* Mobile Number */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-phone text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Mobile Number</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm font-mono block">
                {formData.phone ? `+91 ${formData.phone}` : '-'}
              </span>
            ) : (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white font-mono"
                placeholder="Mobile Number"
              />
            )}
          </div>
        </div>

        {/* Relationship */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-handshake text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Relationship</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm block">
                {formData.relationship || '-'}
              </span>
            ) : (
              <select
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white cursor-pointer"
              >
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Company */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-building text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Company</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm block">
                {formData.company || '-'}
              </span>
            ) : (
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2.5 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white"
                placeholder="Company Name"
              />
            )}
          </div>
        </div>

        {/* Follow Up */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 text-[#007788] mt-0.5">
            <i className="fa-solid fa-bell text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-gray-400 font-medium block">Follow Up</span>
            {!isEditing ? (
              <span className="font-bold text-gray-900 text-sm block">
                {formData.followUp}
              </span>
            ) : (
              <select
                value={formData.followUp}
                onChange={(e) => handleInputChange('followUp', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 px-2 py-1.5 bg-gray-50 border border-[#007788] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
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
