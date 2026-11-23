import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Check, Calendar, Building, ShieldCheck, UserCheck } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'user', label: 'User' }
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
];

const EmployeeAdvancedFilters = ({
  isOpen,
  onClose,
  employees = [],
  appliedFilters,
  onApplyFilters,
  onLiveChange
}) => {
  // Draft filter state (also notifies live updates on user clicks)
  const [draftFilters, setDraftFilters] = useState({
    roles: [],
    departments: [],
    dateRange: { from: '', to: '' },
    statuses: []
  });

  // Global search inside the filter panel
  const [panelSearch, setPanelSearch] = useState('');

  // Department-specific internal search
  const [deptSearch, setDeptSearch] = useState('');

  // Departments fetched dynamically from MongoDB API
  const [apiDepartments, setApiDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [deptError, setDeptError] = useState('');

  const panelRef = useRef(null);

  // Fetch departments from MongoDB API on mount / open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      setDeptError('');
      try {
        const res = await axiosClient.get('/users/departments');
        if (isMounted && res.data?.departments) {
          setApiDepartments(res.data.departments);
        }
      } catch (err) {
        console.warn('Failed to fetch departments from API, using employee dataset:', err);
        if (isMounted) {
          setDeptError('Live API unavailable; falling back to current employee records.');
        }
      } finally {
        if (isMounted) setLoadingDepts(false);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Sync draft state from appliedFilters whenever panel opens
  useEffect(() => {
    if (isOpen && appliedFilters) {
      setDraftFilters({
        roles: appliedFilters.roles ? [...appliedFilters.roles] : [],
        departments: appliedFilters.departments ? [...appliedFilters.departments] : [],
        dateRange: appliedFilters.dateRange
          ? { ...appliedFilters.dateRange }
          : { from: '', to: '' },
        statuses: appliedFilters.statuses ? [...appliedFilters.statuses] : []
      });
      setPanelSearch('');
      setDeptSearch('');
    }
  }, [isOpen, appliedFilters]);

  // Click outside to close (without applying draft changes)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Derive consolidated list of unique departments from MongoDB API + current employees
  const departmentList = useMemo(() => {
    const map = new Map();

    // 1. First add from API if available
    apiDepartments.forEach((d) => {
      const name = d.name || d.id;
      if (name) {
        map.set(name, { id: d.id || name, name, count: d.count || 0 });
      }
    });

    // 2. Supplement / recalculate from current employee array
    employees.forEach((emp) => {
      const deptName = (emp.department && emp.department.trim()) || 'General';
      if (!map.has(deptName)) {
        map.set(deptName, { id: deptName, name: deptName, count: 1 });
      } else {
        const existing = map.get(deptName);
        existing.count = (existing.count || 0) + 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [apiDepartments, employees]);

  // Calculate live counts for roles
  const roleCounts = useMemo(() => {
    const counts = { admin: 0, employee: 0, user: 0 };
    employees.forEach((e) => {
      const r = (e.role || 'employee').toLowerCase();
      if (counts[r] !== undefined) counts[r]++;
    });
    return counts;
  }, [employees]);

  // Calculate live counts for statuses
  const statusCounts = useMemo(() => {
    const counts = { Active: 0, Inactive: 0 };
    employees.forEach((e) => {
      const s = e.status === 'Inactive' || e.status === 'inactive' ? 'Inactive' : 'Active';
      counts[s]++;
    });
    return counts;
  }, [employees]);

  // Live preview matching count for the draft filters
  const livePreviewCount = useMemo(() => {
    const { roles, departments, dateRange, statuses } = draftFilters;
    const hasRoles = roles.length > 0;
    const hasDepts = departments.length > 0;
    const hasStatuses = statuses.length > 0;
    const hasFrom = !!dateRange.from;
    const hasTo = !!dateRange.to;

    return employees.filter((emp) => {
      // 1. Role match (OR within category)
      if (hasRoles && !roles.includes((emp.role || 'employee').toLowerCase())) {
        return false;
      }
      // 2. Department match (OR within category)
      const empDept = emp.department || 'General';
      if (hasDepts && !departments.includes(empDept)) {
        return false;
      }
      // 3. Status match (OR within category)
      const empStatus = emp.status === 'Inactive' || emp.status === 'inactive' ? 'Inactive' : 'Active';
      if (hasStatuses && !statuses.includes(empStatus)) {
        return false;
      }
      // 4. Date range match
      if (hasFrom || hasTo) {
        if (!emp.createdAt) return false;
        const empDate = new Date(emp.createdAt).toISOString().split('T')[0];
        if (hasFrom && empDate < dateRange.from) return false;
        if (hasTo && empDate > dateRange.to) return false;
      }
      return true;
    }).length;
  }, [employees, draftFilters]);

  // Draft selection count
  const draftSelectedCount =
    draftFilters.roles.length +
    draftFilters.departments.length +
    draftFilters.statuses.length +
    (draftFilters.dateRange.from || draftFilters.dateRange.to ? 1 : 0);

  // Toggle helpers with instant live change dispatching
  const toggleRole = (roleVal) => {
    setDraftFilters((prev) => {
      const exists = prev.roles.includes(roleVal);
      const updated = {
        ...prev,
        roles: exists ? prev.roles.filter((r) => r !== roleVal) : [...prev.roles, roleVal]
      };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const toggleDepartment = (deptName) => {
    setDraftFilters((prev) => {
      const exists = prev.departments.includes(deptName);
      const updated = {
        ...prev,
        departments: exists
          ? prev.departments.filter((d) => d !== deptName)
          : [...prev.departments, deptName]
      };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const toggleStatus = (statusVal) => {
    setDraftFilters((prev) => {
      const exists = prev.statuses.includes(statusVal);
      const updated = {
        ...prev,
        statuses: exists
          ? prev.statuses.filter((s) => s !== statusVal)
          : [...prev.statuses, statusVal]
      };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const selectAllDepartments = () => {
    const allNames = filteredDepartments.map((d) => d.name);
    setDraftFilters((prev) => {
      const updated = {
        ...prev,
        departments: Array.from(new Set([...prev.departments, ...allNames]))
      };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const clearDepartments = () => {
    setDraftFilters((prev) => {
      const updated = { ...prev, departments: [] };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const handleDateChange = (field, value) => {
    setDraftFilters((prev) => {
      const updated = {
        ...prev,
        dateRange: { ...prev.dateRange, [field]: value }
      };
      onLiveChange?.(updated);
      return updated;
    });
  };

  const handleClearAllDrafts = () => {
    const reset = {
      roles: [],
      departments: [],
      dateRange: { from: '', to: '' },
      statuses: []
    };
    setDraftFilters(reset);
    setPanelSearch('');
    setDeptSearch('');
    onLiveChange?.(reset);
  };

  const handleApply = () => {
    // Validate date range
    if (draftFilters.dateRange.from && draftFilters.dateRange.to) {
      if (draftFilters.dateRange.from > draftFilters.dateRange.to) {
        alert('Invalid Date Range: "From Date" cannot be after "To Date".');
        return;
      }
    }
    onApplyFilters(draftFilters);
    onClose();
  };

  // Filter departments by deptSearch
  const filteredDepartments = useMemo(() => {
    const q = deptSearch.toLowerCase().trim();
    if (!q) return departmentList;
    return departmentList.filter((d) => d.name.toLowerCase().includes(q));
  }, [departmentList, deptSearch]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden" onClick={onClose} />

      {/* Advanced Filter Panel Dropdown */}
      <div
        ref={panelRef}
        className="fixed inset-x-4 top-20 bottom-20 sm:bottom-auto sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-gray-200/90 z-50 flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] sm:max-h-[580px]"
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#31747d] rounded-full inline-block" />
            <h3 className="font-bold text-sm text-gray-900 tracking-tight">Advanced Filters</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            title="Close filter panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* Global Search inside Panel */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={panelSearch}
              onChange={(e) => setPanelSearch(e.target.value)}
              placeholder="Search filter options..."
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#31747d]"
            />
            {panelSearch && (
              <button
                type="button"
                onClick={() => setPanelSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Filter Sections Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Section A: SYSTEM ROLE */}
          {(!panelSearch || 'system role admin employee user'.includes(panelSearch.toLowerCase())) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  A. System Role
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {draftFilters.roles.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {ROLE_OPTIONS.map((opt) => {
                  const isChecked = draftFilters.roles.includes(opt.value);
                  const count = roleCounts[opt.value] || 0;
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRole(opt.value)}
                          className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                        />
                        <span className="text-gray-800 font-medium">{opt.label}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section B: DEPARTMENT (Dynamic from MongoDB) */}
          {(!panelSearch || 'department'.includes(panelSearch.toLowerCase()) || filteredDepartments.length > 0) && (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  B. Department
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllDepartments}
                    className="text-[#31747d] hover:underline cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={clearDepartments}
                    className="text-gray-400 hover:text-gray-600 hover:underline cursor-pointer font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Department internal search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="Search Departments"
                  className="w-full pl-7 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-800 focus:outline-none focus:border-[#31747d]"
                />
                {deptSearch && (
                  <button
                    type="button"
                    onClick={() => setDeptSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Loading / Error / Empty indicator */}
              {loadingDepts && (
                <p className="text-[11px] text-gray-400 italic">Loading departments from MongoDB...</p>
              )}
              {deptError && (
                <p className="text-[10px] text-amber-600 italic">{deptError}</p>
              )}

              {/* Scrollable list of departments */}
              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                {filteredDepartments.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic py-1">No departments found.</p>
                ) : (
                  filteredDepartments.map((dept) => {
                    const isChecked = draftFilters.departments.includes(dept.name);
                    return (
                      <label
                        key={dept.id || dept.name}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDepartment(dept.name)}
                            className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer shrink-0"
                          />
                          <span className="text-gray-800 font-medium truncate" title={dept.name}>
                            {dept.name}
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                          {dept.count}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Section C: REGISTRATION DATE */}
          {(!panelSearch || 'registration date registered created'.includes(panelSearch.toLowerCase())) && (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                C. Registration Date
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={draftFilters.dateRange.from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-none focus:border-[#31747d]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={draftFilters.dateRange.to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-none focus:border-[#31747d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section D: ACCOUNT STATUS */}
          {(!panelSearch || 'account status active inactive'.includes(panelSearch.toLowerCase())) && (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                D. Account Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const isChecked = draftFilters.statuses.includes(opt.value);
                  const count = statusCounts[opt.value] || 0;
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer text-xs transition-colors border border-gray-100"
                    >
                      <span className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStatus(opt.value)}
                          className="w-3.5 h-3.5 text-[#31747d] rounded border-gray-300 focus:ring-[#31747d] cursor-pointer"
                        />
                        <span className="text-gray-800 font-medium">{opt.label}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer (Sticky / Fixed at Bottom) */}
        <div className="p-3.5 border-t border-gray-100 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {draftSelectedCount > 0 ? (
              <button
                type="button"
                onClick={handleClearAllDrafts}
                className="text-rose-600 hover:text-rose-800 hover:underline font-medium cursor-pointer"
              >
                Clear All
              </button>
            ) : (
              <span className="text-gray-400">No filters</span>
            )}
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-mono">
              <strong>{livePreviewCount}</strong> matches
            </span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Apply Filters {draftSelectedCount > 0 ? `(${draftSelectedCount})` : ''}
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeAdvancedFilters;
