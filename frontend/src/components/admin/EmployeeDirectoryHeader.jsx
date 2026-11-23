import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

const EmployeeDirectoryHeader = ({ onRefresh, onAddEmployee, loading = false }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
      {/* Left Section: Heading & Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">
          Staff Directory
        </h1>
        <p className="text-xs text-gray-500 font-sans mt-0.5">
          Manage your employees and access
        </p>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 bg-white border border-gray-200 hover:border-[#31747d] text-gray-600 hover:text-[#31747d] rounded-full transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh List"
          aria-label="Refresh List"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-[#31747d]' : ''} />
        </button>

        <button
          onClick={onAddEmployee}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold text-xs shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#31747d]/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeDirectoryHeader;
