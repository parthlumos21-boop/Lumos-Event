import React, { useState, useEffect } from 'react';
import { X, Save, Phone, Mail, User as UserIcon, Star, MessageSquare } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const relationshipOptions = [
  { value: 'Existing Customer', label: 'Existing Customer' },
  { value: 'Potential Customer', label: 'Potential Customer' },
  { value: 'Architect / Interior Designer', label: 'Architect / Interior Designer' },
  { value: 'Builder / Developer', label: 'Builder / Developer' },
  { value: 'Business Partner', label: 'Business Partner' },
  { value: 'Vendor / Supplier', label: 'Vendor / Supplier' },
  { value: 'Friend / Family', label: 'Friend / Family' },
  { value: 'Other', label: 'Other' }
];

const roleOptions = [
  { value: 'admin', label: 'Admin (Full Access)' },
  { value: 'employee', label: 'Employee (Guest Operations)' },
  { value: 'user', label: 'User (Standard Member)' }
];

const departmentOptions = [
  { value: 'General', label: 'General' },
  { value: 'Sales', label: 'Sales & Client Relations' },
  { value: 'Design', label: 'Interior & Architectural Design' },
  { value: 'Engineering', label: 'Smart Automation Engineering' },
  { value: 'Operations', label: 'Operations & Event Coordination' },
  { value: 'Management', label: 'Executive Management' },
  { value: 'Support', label: 'Customer Support' }
];

const EditRecordModal = ({ isOpen, onClose, record, type = 'guest', onSave }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      if (type === 'guest') {
        const isStandardRel = relationshipOptions.some(r => r.value === record.relationship && r.value !== 'Other');
        const relValue = isStandardRel ? record.relationship : (record.relationship ? 'Other' : '');
        const relOther = !isStandardRel && record.relationship ? record.relationship : '';

        setFormData({
          name: record.guest?.name || '',
          phone: record.guest?.phone || '',
          email: record.guest?.email || '',
          relationship: relValue,
          relationshipOther: relOther,
          interests: record.interests || [],
          rating: record.feedback?.rating || 0,
          comments: record.feedback?.comments || ''
        });
      } else {
        setFormData({
          name: record.name || '',
          email: record.email || '',
          role: record.role || 'employee',
          department: record.department || 'General'
        });
      }
      setError('');
    }
  }, [record, type, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (type === 'guest') {
        const resolvedRelationship = formData.relationship === 'Other' && formData.relationshipOther
          ? formData.relationshipOther.trim()
          : (formData.relationship || 'Visitor');

        const payload = {
          guest: {
            name: formData.name ? formData.name.trim() : '',
            phone: formData.phone ? formData.phone.trim() : '',
            email: formData.email ? formData.email.trim() : ''
          },
          relationship: resolvedRelationship,
          interests: formData.interests || [],
          feedback: {
            rating: Number(formData.rating) || 0,
            liked: record.feedback?.liked || [],
            comments: formData.comments ? formData.comments.trim() : ''
          }
        };
        await onSave(record._id, payload);
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: (formData.role || 'employee').toLowerCase().trim(),
          department: (formData.department && formData.department.trim()) ? formData.department.trim() : 'General'
        };
        await onSave(record._id, payload);
      }
      onClose();
    } catch (err) {
      console.error('Error updating record:', err);
      setError(err.response?.data?.message || 'Failed to save updates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 font-sans my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Edit {type === 'guest' ? 'Guest Record' : 'Employee Details'}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {record._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          {type === 'guest' ? (
            <>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                    />
                  </div>
                </div>
              </div>

              {/* Relationship Field with Searchable Dropdown */}
              <div>
                <SearchableSelect
                  label="Relationship"
                  options={relationshipOptions}
                  value={formData.relationship || ''}
                  onChange={(val) => setFormData({ ...formData, relationship: val })}
                  placeholder="Select relationship..."
                  searchPlaceholder="Search relationship..."
                />

                {/* Conditional "Other" text input field */}
                {formData.relationship === 'Other' && (
                  <div className="mt-2.5">
                    <label className="block font-semibold text-gray-700 mb-1">
                      Please Specify Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.relationshipOther || ''}
                      onChange={(e) => setFormData({ ...formData, relationshipOther: e.target.value })}
                      placeholder="e.g. VIP Delegate, College Friend, Media..."
                      className="w-full px-3 py-2 bg-white border border-[#31747d] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#31747d]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="relative">
                  <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 fill-yellow-400" />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.rating || 0}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Comments / Suggestions</label>
                <textarea
                  rows="3"
                  value={formData.comments || ''}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Additional feedback or notes..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#31747d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Searchable Role Selection */}
                <div>
                  <SearchableSelect
                    label="Role"
                    required
                    options={roleOptions}
                    value={formData.role || 'employee'}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                    placeholder="Select role"
                    searchPlaceholder="Search role..."
                  />
                </div>

                {/* Searchable Department Selection */}
                <div>
                  <SearchableSelect
                    label="Department (Optional)"
                    options={departmentOptions}
                    value={formData.department || 'General'}
                    onChange={(val) => setFormData({ ...formData, department: val })}
                    placeholder="Select department"
                    searchPlaceholder="Search department..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;
