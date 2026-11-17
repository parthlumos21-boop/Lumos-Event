import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Table from '../common/Table';
import AddEmployeeModal from './AddEmployeeModal';
import EditRecordModal from '../common/EditRecordModal';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Plus, RefreshCw, Mail, Building, ShieldCheck, Calendar } from 'lucide-react';

const AdminEmployees = () => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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

  const handleDelete = async (ids) => {
    try {
      if (ids.length === 1) {
        await axiosClient.delete(`/users/${ids[0]}`);
      } else {
        await axiosClient.delete('/users/batch', { data: { ids } });
      }
      setSuccessMsg(`Successfully deleted ${ids.length} employee(s).`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employees:', err);
      setError(err.response?.data?.message || 'Failed to delete selected employee(s).');
      setTimeout(() => setError(''), 4000);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#31747d]/15 text-[#31747d] font-bold text-xs flex items-center justify-center font-mono">
            {row.name ? row.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block font-sans">{row.name}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'System Role',
      render: (row) => {
        const isAdmin = row.role === 'admin';
        const isUser = row.role === 'user';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize font-mono ${
              isAdmin
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : isUser
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-[#31747d]/10 text-[#31747d] border border-[#31747d]/20'
            }`}
          >
            {isAdmin && <ShieldCheck size={11} />}
            {row.role || 'employee'}
          </span>
        );
      }
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-700 font-sans">
          <Building size={12} className="text-gray-400" />
          {row.department || 'General'}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Work Email',
      render: (row) => (
        <span className="text-xs text-gray-600 inline-flex items-center gap-1 font-mono">
          <Mail size={12} className="text-gray-400" />
          {row.email}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Registered On',
      render: (row) => {
        const d = row.createdAt ? new Date(row.createdAt) : null;
        return d ? (
          <span className="text-xs text-gray-500 font-mono inline-flex items-center gap-1">
            <Calendar size={11} />
            {d.toLocaleDateString()}
          </span>
        ) : '-';
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header with Add Employee Button on Top Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">Employee Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            All records from MongoDB <span className="font-mono text-[#31747d]">users</span> collection in <span className="font-mono text-[#31747d]">LumosEvent</span> Database
          </p>
        </div>

        {/* Top Right Action Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="p-2 bg-white border border-gray-200 hover:border-[#31747d] text-gray-600 hover:text-[#31747d] rounded-full transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#31747d]' : ''} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold text-xs shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#31747d]/40 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

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

      {/* Modernized Compact Table with Checkboxes, Serial No. & Actions */}
      <Table
        columns={columns}
        data={employees}
        keyField="_id"
        pageSize={10}
        role={role || 'admin'}
        onUpdate={(emp) => setEditingEmployee(emp)}
        onDelete={handleDelete}
        emptyMessage={loading ? 'Loading employee records...' : 'No employees found in LumosEvent.users collection.'}
      />

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
