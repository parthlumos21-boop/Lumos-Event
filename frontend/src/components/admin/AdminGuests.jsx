import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Table from '../common/Table';
import EditRecordModal from '../common/EditRecordModal';
import { useAuth } from '../../context/AuthContext';
import { Users, Star, RefreshCw, Calendar, Phone, Mail, Building, Plus } from 'lucide-react';
import { DASHBOARD_FILTER_MAP } from '../dashboard/GuestInsightsPanels';
import { GuestExportDropdown } from '../guest/GuestExportDropdown';

const AdminGuests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingGuest, setEditingGuest] = useState(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError('');
    try {
      const searchParams = new URLSearchParams(location.search);
      const params = {};
      const qInterest = searchParams.get('interest');
      const qRel = searchParams.get('relationship');

      if (qInterest) {
        const mapped = DASHBOARD_FILTER_MAP?.interests?.[qInterest] || [qInterest];
        params.interest = mapped.join(',');
      }
      if (qRel) {
        const mapped = DASHBOARD_FILTER_MAP?.relationships?.[qRel] || [qRel];
        params.relationship = mapped.join(',');
      }

      const res = await axiosClient.get('/guests', { params });
      setGuests(res.data?.guests || []);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to fetch guests from LumosEvent database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [location.search]);

  const handleUpdateSave = async (id, updatedFields) => {
    const res = await axiosClient.put(`/guests/${id}`, updatedFields);
    setSuccessMsg('Guest record updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchGuests();
    return res.data;
  };

  const handleDelete = async (ids) => {
    try {
      if (ids.length === 1) {
        await axiosClient.delete(`/guests/${ids[0]}`);
      } else {
        await axiosClient.delete('/guests/batch', { data: { ids } });
      }
      setSuccessMsg(`Successfully deleted ${ids.length} guest record(s).`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchGuests();
    } catch (err) {
      console.error('Error deleting guests:', err);
      setError(err.response?.data?.message || 'Failed to delete selected guest(s).');
      setTimeout(() => setError(''), 4000);
    }
  };

  const columns = [
    {
      key: 'guest.name',
      label: 'Guest Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block font-sans">{row.guest?.name || '-'}</span>
          {row.guest?.company && (
            <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <Building size={10} /> {row.guest.company}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'guest.phone',
      label: 'Mobile',
      render: (row) => (
        <span className="font-mono text-xs text-gray-700 inline-flex items-center gap-1">
          <Phone size={11} className="text-[#31747d]" />
          {row.guest?.phone ? `+91 ${row.guest.phone}` : '-'}
        </span>
      )
    },
    {
      key: 'guest.email',
      label: 'Email',
      render: (row) => (
        <span className="text-xs text-gray-600 inline-flex items-center gap-1">
          {row.guest?.email ? (
            <>
              <Mail size={11} className="text-gray-400" />
              {row.guest.email}
            </>
          ) : (
            <span className="text-gray-400 italic">None</span>
          )}
        </span>
      )
    },
    {
      key: 'relationship',
      label: 'Relationship',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#31747d]/10 text-[#31747d] border border-[#31747d]/20">
          {row.relationship || 'Visitor'}
        </span>
      )
    },
    {
      key: 'interests',
      label: 'Interests',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.interests && row.interests.length > 0 ? (
            row.interests.slice(0, 3).map((item, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                {item}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          {row.interests && row.interests.length > 3 && (
            <span className="text-[10px] text-gray-400 font-mono">+{row.interests.length - 3}</span>
          )}
        </div>
      )
    },
    {
      key: 'feedback.rating',
      label: 'Rating',
      render: (row) => {
        const rating = row.feedback?.rating;
        return rating > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold font-mono text-xs">
            <Star size={12} fill="currentColor" /> {rating}/5
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        );
      }
    },
    {
      key: 'feedback.staffRating',
      label: 'Staff',
      render: (row) => {
        const staffRating = row.feedback?.staffRating;
        return staffRating > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold font-mono text-xs">
            <Star size={12} fill="currentColor" /> {staffRating}/5
          </span>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        );
      }
    },
    {
      key: 'createdBy.name',
      label: 'Added By',
      render: (row) => {
        const creatorName = row.createdBy?.name || 'Admin';
        const creatorRole = row.createdBy?.role || 'admin';
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#31747d]/10 text-[#31747d] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
              {creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-gray-900 block text-xs truncate max-w-[120px]">
                {creatorName}
              </span>
              <span className="text-[10px] text-gray-400 capitalize block">
                {creatorRole}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Date Added',
      render: (row) => {
        const d = row.createdAt ? new Date(row.createdAt) : null;
        return d ? (
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
            <Calendar size={11} />
            {d.toLocaleDateString()}
          </span>
        ) : '-';
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#31747d] tracking-tight">Guests Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage guests registered for the Lumos event.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/admin/form')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#31747d] hover:bg-[#255b62] text-white rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Guest</span>
          </button>

          <GuestExportDropdown />

          <button
            onClick={fetchGuests}
            disabled={loading}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="p-2.5 bg-white border border-gray-200 hover:border-[#31747d] text-gray-700 hover:text-[#31747d] rounded-full shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#31747d]' : ''} />
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
        data={guests}
        keyField="_id"
        pageSize={10}
        role={role || 'admin'}
        onUpdate={(guest) => setEditingGuest(guest)}
        onDelete={handleDelete}
        onRowDoubleClick={(row) => navigate(`/admin/guests/${row._id}`)}
        emptyMessage={loading ? 'Loading guest records...' : 'No guest records found in LumosEvent database.'}
      />

      {/* Edit Guest Modal */}
      <EditRecordModal
        isOpen={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        record={editingGuest}
        type="guest"
        onSave={handleUpdateSave}
      />
    </div>
  );
};

export default AdminGuests;
