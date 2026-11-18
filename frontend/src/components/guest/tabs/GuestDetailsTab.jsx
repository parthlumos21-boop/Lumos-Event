import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../common/SearchableSelect';

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

const AVAILABLE_INTERESTS = [
  'Lighting',
  'Automation',
  'Audio & Visuals',
  'Security & Surveillance',
  'Home Theater',
  'Smart Locks',
  'HVAC'
];

const PREFERRED_METHODS = ['Phone', 'Email', 'WhatsApp', 'In-Person'];

const GuestDetailsTab = ({ guest, onSave, saving, successMsg, errorMsg }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    relationship: 'Potential Customer',
    relationshipOther: '',
    interests: [],
    rating: 5,
    followUpRequired: false,
    preferredMethod: 'Phone',
    comments: '',
    remarks: ''
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (guest) {
      const g = guest.guest || {};
      const feedback = guest.feedback || {};
      const followUp = guest.followUp || {};

      const isKnownRel = RELATIONSHIP_OPTIONS.includes(guest.relationship);
      const initialRel = isKnownRel ? guest.relationship : 'Other';
      const initialOther = isKnownRel ? '' : guest.relationship || '';

      setFormData({
        name: g.name || '',
        phone: g.phone || '',
        email: g.email || '',
        company: g.company || '',
        relationship: initialRel,
        relationshipOther: initialOther,
        interests: Array.isArray(guest.interests) ? [...guest.interests] : [],
        rating: Number(feedback.rating) || 5,
        followUpRequired: !!followUp.required,
        preferredMethod: followUp.preferredMethod || 'Phone',
        comments: feedback.comments || '',
        remarks: ''
      });
      setHasChanges(false);
    }
  }, [guest]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleInterestToggle = (item) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(item);
      const updated = exists
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item];
      return { ...prev, interests: updated };
    });
    setHasChanges(true);
  };

  const handleReset = () => {
    if (guest) {
      const g = guest.guest || {};
      const feedback = guest.feedback || {};
      const followUp = guest.followUp || {};
      const isKnownRel = RELATIONSHIP_OPTIONS.includes(guest.relationship);

      setFormData({
        name: g.name || '',
        phone: g.phone || '',
        email: g.email || '',
        company: g.company || '',
        relationship: isKnownRel ? guest.relationship : 'Other',
        relationshipOther: isKnownRel ? '' : guest.relationship || '',
        interests: Array.isArray(guest.interests) ? [...guest.interests] : [],
        rating: Number(feedback.rating) || 5,
        followUpRequired: !!followUp.required,
        preferredMethod: followUp.preferredMethod || 'Phone',
        comments: feedback.comments || '',
        remarks: ''
      });
      setHasChanges(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRelationship =
      formData.relationship === 'Other' && formData.relationshipOther.trim()
        ? formData.relationshipOther.trim()
        : formData.relationship;

    const payload = {
      guest: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        company: formData.company.trim()
      },
      relationship: finalRelationship,
      interests: formData.interests,
      followUp: {
        required: formData.followUpRequired,
        preferredMethod: formData.preferredMethod
      },
      feedback: {
        rating: formData.rating,
        comments: formData.comments.trim()
      },
      remarks: formData.remarks.trim() || 'Updated via Guest Details form'
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation text-red-600 text-sm shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Guest Information Section */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-user text-[#007788]" />
            <span>Personal & Company Information</span>
          </h3>
          {hasChanges && (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold animate-pulse">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Parth Joshi"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all font-mono"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. parth@example.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Company / Firm
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="e.g. Lumos Solutions"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Relationship with Lumos <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={RELATIONSHIP_OPTIONS}
            value={formData.relationship}
            onChange={(val) => handleChange('relationship', val)}
            placeholder="Search or select relationship..."
          />
          {formData.relationship === 'Other' && (
            <div className="mt-2.5">
              <input
                type="text"
                required
                value={formData.relationshipOther}
                onChange={(e) => handleChange('relationshipOther', e.target.value)}
                placeholder="Please specify relationship..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Areas of Interest Section - Shows only selected tabs stored in MongoDB */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-tags text-[#007788]" />
            <span>Areas of Interest</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {formData.interests.length} selected
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {formData.interests && formData.interests.length > 0 ? (
            formData.interests.map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#007788] text-white shadow-2xs inline-flex items-center gap-2"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleInterestToggle(item)}
                  className="text-white/80 hover:text-white transition-opacity cursor-pointer"
                  title={`Remove ${item}`}
                >
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No areas of interest selected.</p>
          )}

          {/* Quick Add Selector if some available interests are not yet selected */}
          {AVAILABLE_INTERESTS.filter((i) => !formData.interests.includes(i)).length > 0 && (
            <div className="relative inline-block">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleInterestToggle(e.target.value);
                  }
                }}
                className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-[#007788]/60 text-[#007788] text-xs font-semibold rounded-full cursor-pointer focus:outline-none"
              >
                <option value="">+ Add Interest...</option>
                {AVAILABLE_INTERESTS.filter((i) => !formData.interests.includes(i)).map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Rating & Feedback Section */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
          <i className="fa-solid fa-star text-amber-400" />
          <span>How Was Your Visit? & Feedback</span>
        </h3>

        {/* Star Rating */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Guest Rating ({formData.rating}/5)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleChange('rating', star)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                <i
                  className={`fa-solid fa-star text-xl ${
                    star <= formData.rating ? 'text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs text-gray-500 font-medium ml-2">
              {formData.rating === 5
                ? 'Excellent'
                : formData.rating === 4
                ? 'Very Good'
                : formData.rating === 3
                ? 'Good'
                : formData.rating === 2
                ? 'Fair'
                : 'Poor'}
            </span>
          </div>
        </div>

        {/* Follow-up Required Toggle */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-800">Requires Follow-up Interaction</p>
            <p className="text-[11px] text-gray-500">Should staff follow up after the event?</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChange('followUpRequired', true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                formData.followUpRequired
                  ? 'bg-[#007788] text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleChange('followUpRequired', false)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !formData.followUpRequired
                  ? 'bg-gray-700 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Preferred Method */}
        {formData.followUpRequired && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Preferred Follow-up Method
            </label>
            <SearchableSelect
              options={PREFERRED_METHODS}
              value={formData.preferredMethod}
              onChange={(val) => handleChange('preferredMethod', val)}
              placeholder="Select preferred method..."
            />
          </div>
        )}

        {/* Comments / Suggestions */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Comments / Suggestions
          </label>
          <textarea
            rows={3}
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            placeholder="Guest comments, feedback, or suggestions..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Audit Remarks Section */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <i className="fa-solid fa-comment-dots text-[#007788]" />
          <h3 className="text-sm font-bold text-gray-900">Audit Remarks</h3>
        </div>
        <input
          type="text"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="e.g. Updated mobile number and interest areas following customer call"
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#007788] focus:outline-none transition-all"
        />
      </div>

      {/* Form Action Footer */}
      <div className="p-4 bg-white border border-gray-200/90 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-20">
        <p className="text-xs text-gray-500">
          {hasChanges ? (
            <span className="font-semibold text-amber-600">You have unsaved changes.</span>
          ) : (
            <span>All changes saved to database.</span>
          )}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="fa-solid fa-rotate-left text-xs" />
            <span>Discard Changes</span>
          </button>

          <button
            type="submit"
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-full text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="fa-solid fa-floppy-disk text-xs" />
            <span>{saving ? 'Saving Updates...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default GuestDetailsTab;
