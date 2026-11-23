import React from 'react';
import { X } from 'lucide-react';

const ActiveFilterChips = ({ appliedFilters, onRemoveFilter, onClearAll }) => {
  if (!appliedFilters) return null;

  const {
    roles = [],
    departments = [],
    dateRange = { from: '', to: '' },
    statuses = []
  } = appliedFilters;

  const hasDateRange = dateRange.from || dateRange.to;
  const totalActive =
    roles.length + departments.length + statuses.length + (hasDateRange ? 1 : 0);

  if (totalActive === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {/* Role Chips */}
      {roles.map((role) => (
        <span
          key={`role-${role}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#31747d]/10 text-[#31747d] border border-[#31747d]/20 shadow-2xs"
        >
          <span>Role: <strong className="capitalize">{role}</strong></span>
          <button
            type="button"
            onClick={() => onRemoveFilter('role', role)}
            className="hover:text-red-600 transition-colors cursor-pointer"
            title={`Remove ${role} filter`}
            aria-label={`Remove ${role} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {/* Department Chips */}
      {departments.map((dept) => (
        <span
          key={`dept-${dept}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-[#007788] border border-cyan-200/80 shadow-2xs"
        >
          <span>Dept: <strong>{dept}</strong></span>
          <button
            type="button"
            onClick={() => onRemoveFilter('department', dept)}
            className="hover:text-red-600 transition-colors cursor-pointer"
            title={`Remove ${dept} filter`}
            aria-label={`Remove ${dept} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {/* Status Chips */}
      {statuses.map((status) => (
        <span
          key={`status-${status}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
        >
          <span>Status: <strong>{status}</strong></span>
          <button
            type="button"
            onClick={() => onRemoveFilter('status', status)}
            className="hover:text-red-600 transition-colors cursor-pointer"
            title={`Remove ${status} filter`}
            aria-label={`Remove ${status} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}

      {/* Date Range Chip */}
      {hasDateRange && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <span>
            Registered:{' '}
            <strong>
              {dateRange.from || 'Start'} → {dateRange.to || 'Present'}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => onRemoveFilter('dateRange')}
            className="hover:text-red-600 transition-colors cursor-pointer"
            title="Remove date filter"
            aria-label="Remove date filter"
          >
            <X size={12} />
          </button>
        </span>
      )}

      {/* Clear All Action */}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline ml-1 cursor-pointer transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilterChips;
