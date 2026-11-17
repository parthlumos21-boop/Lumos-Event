import React, { useState } from 'react';
import {
  History,
  Filter,
  ArrowRight,
  User,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const formatVal = (val) => {
  if (val === null || val === undefined || val === '') return '(empty)';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    return val.length === 0 ? '(none)' : val.join(', ');
  }
  return String(val);
};

const SystemHistoryTab = ({
  auditLogs = [],
  totalLogs = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  onFilterChange,
  loading
}) => {
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userQuery, setUserQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyFilters = () => {
    onFilterChange({
      action: actionFilter,
      user: userQuery.trim(),
      startDate,
      endDate
    });
  };

  const resetFilters = () => {
    setActionFilter('ALL');
    setUserQuery('');
    setStartDate('');
    setEndDate('');
    onFilterChange({
      action: 'ALL',
      user: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Stats Banner */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <History size={18} className="text-[#31747d]" />
            <span>Record Audit & Modification History</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tamper-proof chronological system log of every field-level database change
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Total Changes</span>
            <span className="text-base font-bold text-gray-900 font-mono">{totalLogs}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Filter size={13} className="text-[#31747d]" /> Filter Audit Trail
          </span>
          {(actionFilter !== 'ALL' || userQuery || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Action Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#31747d] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE (Registration)</option>
              <option value="UPDATE">UPDATE (Field Changes)</option>
              <option value="DELETE">DELETE (Removal)</option>
            </select>
          </div>

          {/* User Search */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Editor Name/Email</label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g. Keval or Parth"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#31747d] focus:outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#31747d] focus:outline-none font-mono"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">To Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#31747d] focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      {loading ? (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center text-gray-400 text-xs">
          Loading audit trail records...
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center space-y-2">
          <History size={24} className="text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">No audit records found</p>
          <p className="text-xs text-gray-400">
            No system modifications matching your filters have occurred on this profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditLogs.map((log) => {
            const logDate = new Date(log.changedAt);
            const isCreate = log.action === 'CREATE';
            const isDelete = log.action === 'DELETE';

            return (
              <div
                key={log._id}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#31747d]/40 transition-colors"
              >
                {/* Entry Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isCreate
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isDelete
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-[#31747d]/10 text-[#31747d] border-[#31747d]/20'
                      }`}
                    >
                      {log.action}
                    </span>

                    <span className="text-xs font-bold text-gray-900">
                      {log.changedBy?.name || 'Authorized User'}
                    </span>

                    <span className="text-[11px] text-gray-500 font-mono">
                      ({log.changedBy?.role || 'user'})
                    </span>

                    {log.changedBy?.email && (
                      <span className="text-[11px] text-gray-400 font-mono hidden md:inline">
                        · {log.changedBy.email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <Clock size={12} className="text-gray-400" />
                    <span>
                      {logDate.toLocaleDateString()} · {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Remarks if present */}
                {log.remarks && (
                  <p className="text-xs text-gray-600 bg-gray-50/70 px-3.5 py-2 rounded-xl border border-gray-100 italic">
                    Note: "{log.remarks}"
                  </p>
                )}

                {/* Field-Level Diffs Table */}
                {log.changes && log.changes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <th className="py-1.5 pr-4">Modified Field</th>
                          <th className="py-1.5 px-3">Previous Value</th>
                          <th className="w-6 py-1.5 text-center" />
                          <th className="py-1.5 pl-3">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/70">
                        {log.changes.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2.5 pr-4 font-semibold text-gray-800">
                              {ch.fieldLabel || ch.field}
                            </td>
                            <td className="py-2.5 px-3 text-red-600 bg-red-50/40 rounded-l-lg font-mono text-[11px]">
                              {formatVal(ch.oldValue)}
                            </td>
                            <td className="py-2.5 text-center text-gray-300">
                              <ArrowRight size={12} className="mx-auto text-gray-400" />
                            </td>
                            <td className="py-2.5 pl-3 text-emerald-700 bg-emerald-50/40 rounded-r-lg font-semibold font-mono text-[11px]">
                              {formatVal(ch.newValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : isCreate ? (
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle size={14} /> Initial guest registration created in LumosEvent database.
                  </p>
                ) : null}
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-2 flex items-center justify-between text-xs text-gray-600">
              <span>
                Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full font-semibold hover:border-[#31747d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full font-semibold hover:border-[#31747d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemHistoryTab;
