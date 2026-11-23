import React, { useState } from 'react';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!employee) return null;

  const isAdmin = employee.role === 'admin';
  const isUser = employee.role === 'user';

  const formattedDate = employee.createdAt
    ? new Date(employee.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '-';

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between font-sans">
      {/* Section 1: Card Header */}
      <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#31747d]/15 text-[#31747d] font-bold text-xs flex items-center justify-center font-mono shrink-0">
            {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs font-sans truncate" title={employee.name}>
              {employee.name}
            </h3>
            <p className="text-[11px] text-gray-500 font-mono truncate" title={employee.email}>
              {employee.email}
            </p>
          </div>
        </div>

        {/* System Role Badge (Transparent background, no bg color) */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize font-mono shrink-0 bg-transparent ${
            isAdmin
              ? 'text-[#31747d] border border-[#31747d]/40'
              : isUser
              ? 'text-[#3ea9c4] border border-[#3ea9c4]/40'
              : 'text-gray-700 border border-gray-300'
          }`}
        >
          {employee.role || 'employee'}
        </span>
      </div>

      {/* Section 2: Employee Information */}
      <div className="py-0.5">
        {/* 1. EMAIL ID (Clean text, no tooltip) */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100/80 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Email ID
          </span>
          <span className="font-mono text-gray-800 truncate max-w-[65%] text-right font-medium text-[11px]">
            {employee.email}
          </span>
        </div>

        {/* 2. SYSTEM ROLE */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100/80 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            System Role
          </span>
          <span className="font-mono text-gray-800 font-semibold capitalize text-xs">
            {employee.role || 'employee'}
          </span>
        </div>

        {/* 3. DEPARTMENT */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100/80 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Department
          </span>
          <span className="text-gray-800 font-medium text-xs truncate max-w-[65%] text-right">
            {employee.department || 'General'}
          </span>
        </div>

        {/* 4. PASSWORD (Direct from MongoDB with Eye toggle in readable format) */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100/80 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Password
          </span>
          <div className="flex items-center gap-1.5 font-mono text-gray-800 max-w-[65%] justify-end">
            <span
              className={
                showPassword
                  ? 'text-[11px] select-all font-mono font-medium text-gray-800 break-all text-right'
                  : 'tracking-widest text-xs'
              }
              title={showPassword ? employee.password : '••••••••'}
            >
              {showPassword ? (employee.password || '••••••••') : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-[#31747d] transition-colors cursor-pointer shrink-0"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {/* 5. REGISTERED ON */}
        <div className="flex items-center justify-between py-2 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Registered On
          </span>
          <span className="font-mono text-gray-600 text-[11px]">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Section 3: Card Footer / Actions */}
      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-end gap-1 mt-auto">
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="p-1.5 text-gray-500 hover:text-[#31747d] hover:bg-[#31747d]/10 rounded-xl transition-colors cursor-pointer"
          title="Edit Employee"
          aria-label="Edit Employee"
        >
          <Edit size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(employee._id)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title="Delete Employee"
          aria-label="Delete Employee"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
