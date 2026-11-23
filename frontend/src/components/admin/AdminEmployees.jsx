import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import EmployeeDirectoryHeader from './EmployeeDirectoryHeader';
import EmployeeStatistics from './EmployeeStatistics';
import EmployeeCards from './EmployeeCards';
import EmployeeAdvancedFilters from './filters/EmployeeAdvancedFilters';
import ActiveFilterChips from './filters/ActiveFilterChips';
import AddEmployeeModal from './AddEmployeeModal';
import EditRecordModal from '../common/EditRecordModal';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Trash2
} from 'lucide-react';
import clsx from 'clsx';

const AdminEmployees = () => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Filters state (applied to employee records)
  const [appliedFilters, setAppliedFilters] = useState({
    roles: [],
    departments: [],
    dateRange: { from: '', to: '' },
    statuses: []
  });

  // Filter panel open / close state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/users');
      setEmployees(res.data?.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees from LumosEvent database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleUpdateSave = async (id, updatedFields) => {
    const res = await axiosClient.put(`/users/${id}`, updatedFields);
    setSuccessMsg('Employee details updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchEmployees();
    return res.data;
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/users/${deleteTargetId}`);
      setSuccessMsg('Successfully deleted employee.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setDeleteTargetId(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.response?.data?.message || 'Failed to delete employee.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // Remove individual filter chip
  const handleRemoveFilter = (category, value) => {
    if (category === 'role') {
      setAppliedFilters((prev) => ({
        ...prev,
        roles: prev.roles.filter((r) => r !== value)
      }));
    } else if (category === 'department') {
      setAppliedFilters((prev) => ({
        ...prev,
        departments: prev.departments.filter((d) => d !== value)
      }));
    } else if (category === 'status') {
      setAppliedFilters((prev) => ({
        ...prev,
        statuses: prev.statuses.filter((s) => s !== value)
      }));
    } else if (category === 'dateRange') {
      setAppliedFilters((prev) => ({
        ...prev,
        dateRange: { from: '', to: '' }
      }));
    }
  };

  // Clear all filters & search
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setAppliedFilters({
      roles: [],
      departments: [],
      dateRange: { from: '', to: '' },
      statuses: []
    });
  };

  // Fast O(N) multi-select boolean filtering (OR within category, AND across categories)
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const { roles, departments, dateRange, statuses } = appliedFilters;
    const hasRoles = roles.length > 0;
    const hasDepts = departments.length > 0;
    const hasStatuses = statuses.length > 0;
    const hasFrom = !!dateRange.from;
    const hasTo = !!dateRange.to;

    return employees.filter((emp) => {
      // 1. System Role filter (OR within category)
      if (hasRoles && !roles.includes((emp.role || 'employee').toLowerCase())) {
        return false;
      }

      // 2. Department filter (OR within category)
      const empDept = emp.department || 'General';
      if (hasDepts && !departments.includes(empDept)) {
        return false;
      }

      // 3. Account Status filter (OR within category)
      const empStatus = emp.status === 'Inactive' || emp.status === 'inactive' ? 'Inactive' : 'Active';
      if (hasStatuses && !statuses.includes(empStatus)) {
        return false;
      }

      // 4. Registration Date range
      if (hasFrom || hasTo) {
        if (!emp.createdAt) return false;
        const empDate = new Date(emp.createdAt).toISOString().split('T')[0];
        if (hasFrom && empDate < dateRange.from) return false;
        if (hasTo && empDate > dateRange.to) return false;
      }

      // 5. Global text search
      if (q) {
        const nameMatch = emp.name?.toLowerCase().includes(q);
        const emailMatch = emp.email?.toLowerCase().includes(q);
        const deptMatch = emp.department?.toLowerCase().includes(q);
        const roleMatch = emp.role?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !deptMatch && !roleMatch) {
          return false;
        }
      }

      return true;
    });
  }, [employees, searchQuery, appliedFilters]);

  // Active filter count calculation
  const activeFiltersCount =
    appliedFilters.roles.length +
    appliedFilters.departments.length +
    appliedFilters.statuses.length +
    (appliedFilters.dateRange.from || appliedFilters.dateRange.to ? 1 : 0);

  const hasAnyFilterActive = activeFiltersCount > 0 || !!searchQuery;

  // Header quick counts
  const totalCount = employees.length;
  const adminCount = employees.filter((e) => e.role === 'admin').length;
  const staffCount = employees.filter((e) => e.role !== 'admin').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header with Add Employee Button on Top Right */}
      <EmployeeDirectoryHeader
        onRefresh={fetchEmployees}
        onAddEmployee={() => setIsAddModalOpen(true)}
        loading={loading}
      />

      {/* Dynamic 3 Statistics Cards (Total Employees, Admins, Staff) */}
      <EmployeeStatistics
        totalCount={totalCount}
        adminCount={adminCount}
        staffCount={staffCount}
      />

      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-sans">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-sans">
          {successMsg}
        </div>
      )}

      {/* Control Bar: Compact Search Bar positioned directly on the left of Filters Button */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-end gap-3 text-xs">
        {/* Right side: Search bar (reduced width, rounded-full) directly on the LEFT of the Filters button */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end w-full sm:w-auto">
          {/* Reduced-size Search Bar with Rounded Radius Corner */}
          <div className="relative w-full sm:w-60 md:w-68">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:border-[#31747d] text-xs font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Advanced Filters Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={clsx(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer',
                activeFiltersCount > 0
                  ? 'bg-[#31747d] text-white border-[#31747d] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200/90 hover:bg-gray-50 hover:border-gray-300'
              )}
              title="Advanced Multi-select Filters"
            >
              <Filter size={14} className={activeFiltersCount > 0 ? 'text-white' : 'text-gray-500'} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#31747d] font-bold text-[10px] flex items-center justify-center font-mono">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown size={13} className={activeFiltersCount > 0 ? 'text-white/80' : 'text-gray-400'} />
            </button>

            {/* Advanced Filters Dropdown Panel */}
            <EmployeeAdvancedFilters
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              employees={employees}
              appliedFilters={appliedFilters}
              onApplyFilters={(newFilters) => setAppliedFilters(newFilters)}
              onLiveChange={(newFilters) => setAppliedFilters(newFilters)}
            />
          </div>

          {/* Total Records Counter */}
          <div className="px-3 py-1.5 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs font-semibold text-gray-600 font-mono">
            {filteredEmployees.length}{' '}
            <span className="font-sans font-normal text-gray-400">
              {filteredEmployees.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {/* Clear All Active Filters */}
          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      <ActiveFilterChips
        appliedFilters={appliedFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Responsive Employee Cards Grid */}
      <EmployeeCards
        employees={filteredEmployees}
        loading={loading}
        onEdit={(emp) => setEditingEmployee(emp)}
        onDelete={(id) => setDeleteTargetId(id)}
        initialPageSize={9}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center font-sans animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="font-bold text-base text-gray-900">Delete Employee?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-xs cursor-pointer transition-colors shadow-xs"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeAdded={fetchEmployees}
      />

      {/* Edit Employee Modal */}
      <EditRecordModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        record={editingEmployee}
        type="employee"
        onSave={handleUpdateSave}
      />
    </div>
  );
};

export default AdminEmployees;
