import React, { useState } from 'react';
import Modal from '../common/Modal';
import SearchableSelect from '../common/SearchableSelect';
import axiosClient from '../../api/axiosClient';
import { UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Admin (Full Management & Access)' },
    { value: 'employee', label: 'Employee (Event & Guest Operations)' },
    { value: 'user', label: 'User (Standard Member Access)' }
  ];

  const departmentOptions = [
    { value: 'General', label: 'General / Unassigned' },
    { value: 'Sales', label: 'Sales & Client Relations' },
    { value: 'Design', label: 'Interior & Architectural Design' },
    { value: 'Engineering', label: 'Smart Automation Engineering' },
    { value: 'Operations', label: 'Operations & Event Coordination' },
    { value: 'Management', label: 'Executive Management' },
    { value: 'Support', label: 'Customer Support' }
  ];

  const resetForm = () => {
    setName('');
    setRole('employee');
    setDepartment('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Department is optional
    if (!name.trim() || !role || !email.trim() || !password) {
      setError('Please fill in Name, Role, Email, and Password.');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/users', {
        name: name.trim(),
        role: role.toLowerCase().trim(),
        department: (department && department.trim()) ? department.trim() : 'General',
        email: email.trim(),
        password
      });

      setSuccess(true);
      if (onEmployeeAdded) onEmployeeAdded();

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error('Add employee error:', err);
      const msg = err.response?.data?.message || 'Failed to add employee. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Staff Member"
      maxWidth="max-w-lg"
    >
      {success ? (
        <div className="py-8 flex flex-col items-center justify-center text-center font-sans space-y-3">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle size={36} />
          </div>
          <h4 className="text-xl font-bold text-gray-900">Staff Member Added</h4>
          <p className="text-sm text-gray-500">Record successfully created.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-gray-800">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31747d]/20 focus:border-[#31747d] font-sans"
            />
          </div>

          {/* Role Field with Searchable Dropdown */}
          <div>
            <SearchableSelect
              label="System Role"
              required
              options={roleOptions}
              value={role}
              onChange={(val) => setRole(val)}
              placeholder="Select role..."
              searchPlaceholder="Search role..."
            />
          </div>

          {/* Department Field (Unmandatory / Optional) */}
          <div>
            <SearchableSelect
              label="Department (Optional)"
              options={departmentOptions}
              value={department}
              onChange={(val) => setDepartment(val)}
              placeholder="Select department (optional)"
              searchPlaceholder="Search department..."
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Work Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@lumos.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31747d]/20 focus:border-[#31747d] font-sans"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 6 characters)"
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-300 bg-white text-[#31747d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31747d]/20 focus:border-[#31747d] font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#31747d] p-1 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#31747d] hover:bg-[#255b62] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#31747d]/40 disabled:opacity-60 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>{loading ? 'Creating...' : 'Save Staff Member'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddEmployeeModal;
