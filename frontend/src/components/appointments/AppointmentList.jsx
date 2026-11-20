import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Table from '../common/Table';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Phone, MapPin, Tag, RefreshCw, Plus, Search, Building } from 'lucide-react';
import clsx from 'clsx';

export const AppointmentList = ({ portal = 'admin' }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments from Lumos database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRowDoubleClick = (row) => {
    const basePath = portal === 'admin' || role === 'admin' ? '/admin/appointments' : '/user/appointments';
    navigate(`${basePath}/${row._id}`);
  };

  const handleDelete = async (ids) => {
    try {
      if (ids.length === 1) {
        await axiosClient.delete(`/appointments/${ids[0]}`);
      } else {
        await axiosClient.delete('/appointments/batch', { data: { ids } });
      }
      setSuccessMsg(`Successfully deleted ${ids.length} appointment(s).`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment(s):', err);
      setError(err.response?.data?.message || 'Failed to delete selected appointment(s).');
      setTimeout(() => setError(''), 4000);
    }
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#31747d] bg-[#31747d]/10 px-2 py-1 rounded-md border border-[#31747d]/20">
          {row.srNo || '-'}
        </span>
      )
    },
    {
      key: 'clientName',
      label: 'Client Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block font-sans text-sm">{row.clientName}</span>
          <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-sans">
            <MapPin size={10} className="text-gray-400" />
            {row.location}
          </span>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (row) => (
        <a
          href={`tel:${row.contact}`}
          className="font-mono text-xs text-gray-700 inline-flex items-center gap-1.5 hover:text-[#31747d]"
        >
          <Phone size={12} className="text-[#31747d]" />
          <span>+91 {row.contact}</span>
        </a>
      )
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {row.reference || 'Direct Client'}
          </span>
          {row.referenceName && row.reference !== 'Direct Client' && (
            <span className="text-[11px] font-medium text-gray-800 block mt-0.5 truncate max-w-[150px] font-sans">
              👤 {row.referenceName}
            </span>
          )}
          {row.internalReference && (
            <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px] font-sans">
              Ref: {row.internalReference}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'appointmentDate',
      label: 'Schedule',
      render: (row) => {
        const d = row.appointmentDate ? new Date(row.appointmentDate) : null;
        return (
          <div>
            <span className="text-xs font-semibold text-gray-800 font-sans inline-flex items-center gap-1">
              <Calendar size={12} className="text-[#31747d]" />
              {d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
            </span>
            <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
              ⏰ {row.appointmentTime}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isScheduled = row.status === 'Scheduled';
        const isPending = row.status === 'Pending';
        const isCompleted = row.status === 'Completed';
        const isCancelled = row.status === 'Cancelled';
        return (
          <span
            className={clsx(
              'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize font-sans',
              isScheduled && 'bg-[#31747d]/10 text-[#31747d] border-[#31747d]/20',
              isPending && 'bg-amber-50 text-amber-700 border-amber-200',
              isCompleted && 'bg-emerald-50 text-emerald-700 border-emerald-200',
              isCancelled && 'bg-rose-50 text-rose-700 border-rose-200',
              !isScheduled && !isPending && !isCompleted && !isCancelled && 'bg-gray-100 text-gray-700 border-gray-200'
            )}
          >
            {row.status || 'Scheduled'}
          </span>
        );
      }
    },
    {
      key: 'createdBy',
      label: 'Staff / Role',
      render: (row) => (
        <span className="text-xs text-gray-600 font-sans block truncate max-w-[120px]">
          {row.createdBy?.name || 'Staff'}
        </span>
      )
    }
  ];

  const handleAddAppointment = () => {
    const basePath = portal === 'admin' || role === 'admin' ? '/admin/appointmentform' : '/user/appointmentform';
    navigate(basePath);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">Appointments Directory</h1>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            Client automation consultations and scheduled meeting requests
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchAppointments}
            disabled={loading}
            className="p-2 bg-white border border-gray-200 hover:border-[#31747d] text-gray-600 hover:text-[#31747d] rounded-full transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#31747d]' : ''} />
          </button>

          <button
            type="button"
            onClick={handleAddAppointment}
            className="px-4 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Table: Double Click to Open Details Page */}
      <Table
        type="appointments"
        data={appointments.map((app) => ({
          ...app,
          createdAt: app.appointmentDate || app.createdAt
        }))}
        columns={columns}
        loading={loading}
        pageSize={10}
        role={role || 'admin'}
        onDelete={handleDelete}
        onRowDoubleClick={handleRowDoubleClick}
        keyField="_id"
        emptyMessage="No scheduled appointments found."
      />
    </div>
  );
};

export default AppointmentList;
