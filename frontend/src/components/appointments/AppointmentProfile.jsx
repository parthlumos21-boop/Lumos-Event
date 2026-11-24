import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import AppointmentProfileHeader from './AppointmentProfileHeader';
import AppointmentInfoCard from './tabs/AppointmentInfoCard';
import AppointmentScheduleCard from './tabs/AppointmentScheduleCard';
import AppointmentDetailsCard from './tabs/AppointmentDetailsCard';
import AppointmentRecordInfoCard from './tabs/AppointmentRecordInfoCard';
import AppointmentRecentActivitiesCard from './tabs/AppointmentRecentActivitiesCard';
import AppointmentActivitiesTab from './tabs/AppointmentActivitiesTab';
import FollowUpModal from './modals/FollowUpModal';
import FollowUpList from './tabs/FollowUpList';
import FollowUpCard from './tabs/FollowUpCard';
import appointmentFollowUpService from '../../services/appointmentFollowUpService';
import AddAppointmentActivityModal from './modals/AddAppointmentActivityModal';
import AppointmentAuditHistoryModal from './modals/AppointmentAuditHistoryModal';
import SearchableSelect from '../common/SearchableSelect';
import clsx from 'clsx';

export const AppointmentProfile = ({ portal = 'admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [stats, setStats] = useState({ totalChanges: 0, totalActivities: 0 });
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Follow-ups state
  const [followUps, setFollowUps] = useState([]);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [followUpBannerMsg, setFollowUpBannerMsg] = useState('');

  // Reference users for Internal Reference dropdown from MongoDB users collection
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axiosClient.get('/appointments/reference-users');
        if (res.data?.success && Array.isArray(res.data.users)) {
          const opts = res.data.users.map((u) => ({
            label: u.name,
            value: u.name,
            subLabel: `${u.role === 'admin' ? 'Admin' : 'Employee'} • ${u.email || ''}`
          }));
          setUserOptions(opts);
        }
      } catch (err) {
        console.error('Error fetching reference users in appointment profile:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Modal edit state
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    location: '',
    contact: '',
    reference: 'Walk-in Client',
    referenceName: '',
    internalReference: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'Scheduled',
    requirements: '',
    remark: ''
  });

  const fetchAppointment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get(`/appointments/${id}`);
      if (res.data?.success && res.data?.appointment) {
        const app = res.data.appointment;
        setAppointment(app);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.recentAuditLogs) setRecentAuditLogs(res.data.recentAuditLogs);
        if (app.logactivity && app.logactivity.length > 0) {
          setActivities(app.logactivity);
        } else if (res.data.recentActivities) {
          setActivities(res.data.recentActivities);
        }
        if (app.followUps && Array.isArray(app.followUps)) {
          setFollowUps(app.followUps);
        }

        setEditFormData({
          clientName: app.clientName || '',
          location: app.location || '',
          contact: app.contact || '',
          reference: app.reference === 'Direct Client' ? 'Walk-in Client' : (app.reference || 'Walk-in Client'),
          referenceName: app.referenceName || '',
          internalReference: app.internalReference || '',
          appointmentDate: app.appointmentDate ? app.appointmentDate.split('T')[0] : '',
          appointmentTime: app.appointmentTime || '',
          status: app.status || 'Scheduled',
          requirements: app.requirements || '',
          remark: app.remark || ''
        });
      } else {
        setError('Appointment record could not be found.');
      }
    } catch (err) {
      console.error('Error fetching appointment profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch appointment record from Lumos database.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchActivities = useCallback(async () => {
    if (!id) return;
    setLoadingActivities(true);
    try {
      const res = await axiosClient.get(`/appointments/${id}/logactivity`);
      if (res.data?.success && Array.isArray(res.data.activities)) {
        setActivities(res.data.activities);
        setStats((prev) => ({ ...prev, totalActivities: res.data.activities.length }));
      }
    } catch (err) {
      try {
        const fallbackRes = await axiosClient.get(`/appointments/${id}/activities`);
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.activities)) {
          setActivities(fallbackRes.data.activities);
          setStats((prev) => ({ ...prev, totalActivities: fallbackRes.data.activities.length }));
        }
      } catch (fErr) {
        console.error('Error fetching activities:', fErr);
      }
    } finally {
      setLoadingActivities(false);
    }
  }, [id]);

  const fetchAllAuditLogs = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axiosClient.get(`/appointments/${id}/audit-logs`);
      if (res.data?.success && Array.isArray(res.data.logs)) {
        setAllAuditLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab, fetchActivities]);

  const handleSaveInline = async (payload) => {
    setSaving(true);
    try {
      const res = await axiosClient.put(`/appointments/${id}`, payload);
      if (res.data?.success && res.data.appointment) {
        setAppointment(res.data.appointment);
        if (res.data.stats) setStats(res.data.stats);
        // Refresh recent audit logs
        const auditRes = await axiosClient.get(`/appointments/${id}/audit-logs?limit=5`);
        if (auditRes.data?.success && Array.isArray(auditRes.data.logs)) {
          setRecentAuditLogs(auditRes.data.logs);
        }
        return true;
      }
    } catch (err) {
      console.error('Error saving inline update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put(`/appointments/${id}`, editFormData);
      if (res.data?.success && res.data.appointment) {
        setAppointment(res.data.appointment);
        if (res.data.stats) setStats(res.data.stats);
        setIsEditModalOpen(false);
        // Refresh audit logs
        const auditRes = await axiosClient.get(`/appointments/${id}/audit-logs?limit=5`);
        if (auditRes.data?.success && Array.isArray(auditRes.data.logs)) {
          setRecentAuditLogs(auditRes.data.logs);
        }
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddActivitySubmit = async (activityData) => {
    setSubmittingActivity(true);
    try {
      const res = await axiosClient.post(`/appointments/${id}/logactivity`, activityData);
      if (res.data?.success && res.data.activity) {
        setActivities((prev) => [res.data.activity, ...prev]);
        setAppointment((prev) => {
          if (!prev) return prev;
          const currentLogs = prev.logactivity || [];
          return {
            ...prev,
            logactivity: [res.data.activity, ...currentLogs]
          };
        });
        setStats((prev) => ({ ...prev, totalActivities: prev.totalActivities + 1 }));
        setIsAddActivityModalOpen(false);

        // Refresh recent audit logs
        try {
          const auditRes = await axiosClient.get(`/appointments/${id}/audit-logs?limit=5`);
          if (auditRes.data?.success && Array.isArray(auditRes.data.logs)) {
            setRecentAuditLogs(auditRes.data.logs);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleOpenAuditModal = () => {
    fetchAllAuditLogs();
    setIsAuditModalOpen(true);
  };

  const fetchFollowUps = useCallback(async () => {
    if (!id) return;
    try {
      const res = await appointmentFollowUpService.getFollowUps(id);
      if (res?.success && Array.isArray(res.followUps)) {
        setFollowUps(res.followUps);
      }
    } catch (err) {
      console.error('Error fetching appointment follow-ups:', err);
    }
  }, [id]);

  const handleSaveFollowUp = async (formData) => {
    setSubmittingFollowUp(true);
    try {
      if (editingFollowUp) {
        await appointmentFollowUpService.updateFollowUp(id, editingFollowUp.followUpId, formData);
        setFollowUpBannerMsg('Follow-up updated successfully.');
      } else {
        await appointmentFollowUpService.createFollowUp(id, formData);
        setFollowUpBannerMsg('Follow-up scheduled with reminders.');
      }
      setIsFollowUpModalOpen(false);
      setEditingFollowUp(null);
      await fetchAppointment();
      await fetchFollowUps();
      setTimeout(() => setFollowUpBannerMsg(''), 4000);
    } catch (err) {
      console.error('Error saving follow-up:', err);
      alert(err.response?.data?.message || 'Failed to save follow-up');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId) => {
    try {
      await appointmentFollowUpService.updateStatus(id, followUpId, 'Completed');
      await fetchAppointment();
      await fetchFollowUps();
      setFollowUpBannerMsg('Follow-up marked as completed.');
      setTimeout(() => setFollowUpBannerMsg(''), 3000);
    } catch (err) {
      console.error('Error completing follow-up:', err);
    }
  };

  const handleCancelFollowUp = async (followUpId) => {
    try {
      await appointmentFollowUpService.updateStatus(id, followUpId, 'Cancelled');
      await fetchAppointment();
      await fetchFollowUps();
      setFollowUpBannerMsg('Follow-up cancelled.');
      setTimeout(() => setFollowUpBannerMsg(''), 3000);
    } catch (err) {
      console.error('Error cancelling follow-up:', err);
    }
  };

  const handleDeleteFollowUp = async (followUpId) => {
    if (!window.confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      await appointmentFollowUpService.deleteFollowUp(id, followUpId);
      await fetchAppointment();
      await fetchFollowUps();
      setFollowUpBannerMsg('Follow-up deleted.');
      setTimeout(() => setFollowUpBannerMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting follow-up:', err);
    }
  };

  const pendingFollowUpsCount = useMemo(() => {
    return (followUps || []).filter((f) => f && (f.status === 'Pending' || f.status === 'Overdue')).length;
  }, [followUps]);

  const upcomingFollowUps = useMemo(() => {
    return (followUps || []).filter((f) => f && (f.status === 'Pending' || f.status === 'Overdue'));
  }, [followUps]);

  const handleBack = () => {
    const basePath = portal === 'admin' || role === 'admin' ? '/admin/appointments' : '/user/appointments';
    navigate(basePath);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 font-sans">
        <div className="w-10 h-10 border-4 border-[#007788] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading appointment profile...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-sm font-sans">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Unable to load appointment</h2>
        <p className="text-xs text-gray-500">{error || 'The requested appointment record does not exist or you do not have permission to view it.'}</p>
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-2.5 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Appointments
        </button>
      </div>
    );
  }

  const d = appointment.appointmentDate ? new Date(appointment.appointmentDate) : new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Back Navigation Bar matching image */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#007788] transition-colors cursor-pointer group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to All Appointments</span>
        </button>
      </div>

      {/* Top Header Card with initial avatar, name, srNo, stats pills & Edit button */}
      <AppointmentProfileHeader
        appointment={appointment}
        stats={stats}
        onEditAll={() => setIsEditModalOpen(true)}
        onRefresh={fetchAppointment}
        onAddFollowUp={() => {
          setEditingFollowUp(null);
          setIsFollowUpModalOpen(true);
        }}
        onViewChanges={() => setIsAuditModalOpen(true)}
        onViewActivities={() => setActiveTab('activities')}
        loading={loading}
      />

      {/* Follow-up / Action Banner Notification */}
      {followUpBannerMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{followUpBannerMsg}</span>
          <button
            type="button"
            onClick={() => setFollowUpBannerMsg('')}
            className="text-emerald-500 hover:text-emerald-800 text-sm font-bold px-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs - Mobile Horizontal Touch Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-1 border-b border-gray-200/80 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none',
            activeTab === 'overview'
              ? 'bg-[#007788] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#007788] hover:bg-gray-100 bg-white border border-gray-200/80'
          )}
        >
          <i className="fa-solid fa-house text-xs" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none',
            activeTab === 'details'
              ? 'bg-[#007788] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#007788] hover:bg-gray-100 bg-white border border-gray-200/80'
          )}
        >
          <i className="fa-solid fa-address-card text-xs" />
          <span>Appointment Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('followups')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none',
            activeTab === 'followups'
              ? 'bg-[#007788] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#007788] hover:bg-gray-100 bg-white border border-gray-200/80'
          )}
        >
          <i className="fa-solid fa-calendar-check text-xs" />
          <span>Follow-ups</span>
          {pendingFollowUpsCount > 0 && (
            <span
              className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none',
                activeTab === 'followups' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              )}
            >
              {pendingFollowUpsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none',
            activeTab === 'activities'
              ? 'bg-[#007788] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#007788] hover:bg-gray-100 bg-white border border-gray-200/80'
          )}
        >
          <i className="fa-solid fa-bolt text-xs" />
          <span>Activities</span>
          {stats?.totalActivities > 0 && (
            <span
              className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none',
                activeTab === 'activities' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              )}
            >
              {stats.totalActivities}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ownership')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none',
            activeTab === 'ownership'
              ? 'bg-[#007788] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#007788] hover:bg-gray-100 bg-white border border-gray-200/80'
          )}
        >
          <i className="fa-solid fa-shield text-xs" />
          <span>Ownership</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Appointment Information, Requirements & Remarks */}
          <div className="lg:col-span-7 space-y-6">
            <AppointmentInfoCard
              appointment={appointment}
              onSave={handleSaveInline}
              saving={saving}
            />

            <AppointmentDetailsCard
              appointment={appointment}
              onSave={handleSaveInline}
              saving={saving}
            />
          </div>

          {/* Right Column (5 cols): Schedule, Follow-ups, Recent Activities & System History */}
          <div className="lg:col-span-5 space-y-6">
            <AppointmentScheduleCard
              appointment={appointment}
              onSave={handleSaveInline}
              saving={saving}
            />

            {/* Upcoming Follow-ups Card */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Upcoming Follow-ups</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFollowUp(null);
                      setIsFollowUpModalOpen(true);
                    }}
                    className="text-xs font-semibold text-[#007788] hover:underline cursor-pointer"
                  >
                    + Add
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('followups')}
                    className="text-xs font-semibold text-[#007788] hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>

              {upcomingFollowUps.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">
                  No upcoming follow-ups scheduled.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFollowUp(null);
                      setIsFollowUpModalOpen(true);
                    }}
                    className="text-[#007788] font-semibold hover:underline cursor-pointer not-italic ml-1"
                  >
                    Schedule one
                  </button>
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingFollowUps.slice(0, 2).map((flw) => (
                    <FollowUpCard
                      key={flw.followUpId}
                      followUp={flw}
                      onComplete={handleCompleteFollowUp}
                      onCancel={handleCancelFollowUp}
                      onEdit={(f) => {
                        setEditingFollowUp(f);
                        setIsFollowUpModalOpen(true);
                      }}
                      onDelete={handleDeleteFollowUp}
                      canManage={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities Card matching image */}
            <AppointmentRecentActivitiesCard
              activities={activities.length > 0 ? activities : (appointment.logactivity || [])}
              onNavigateActivities={() => setActiveTab('activities')}
            />

            {/* System History Card matching image with real audit tracking */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-[#007788] rounded-full inline-block" />
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">System History</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAuditModal}
                  className="text-xs font-semibold text-[#007788] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {recentAuditLogs.slice(0, 3).map((log) => {
                  const logDate = new Date(log.changedAt);
                  const isCreate = log.action === 'CREATE';
                  const summaryText = log.changes && log.changes.length > 0
                    ? `Updated ${log.changes.map((c) => c.fieldLabel || c.field).join(', ')}`
                    : log.remarks || 'Appointment modified';

                  return (
                    <div key={log._id} className="flex items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-[#007788] border border-gray-100 flex items-center justify-center shrink-0 text-xs">
                          <i className={`fa-solid ${isCreate ? 'fa-plus' : 'fa-pen'}`} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-xs block truncate max-w-[200px]">
                            {isCreate ? 'Appointment record created' : summaryText}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            by {log.changedBy?.name || 'Staff'} • {logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                          isCreate
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {isCreate ? 'Created' : 'Updated'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'followups' && (
        <FollowUpList
          followUps={followUps}
          onAddFollowUp={() => {
            setEditingFollowUp(null);
            setIsFollowUpModalOpen(true);
          }}
          onComplete={handleCompleteFollowUp}
          onCancel={handleCancelFollowUp}
          onEdit={(f) => {
            setEditingFollowUp(f);
            setIsFollowUpModalOpen(true);
          }}
          onDelete={handleDeleteFollowUp}
          canManage={true}
        />
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <AppointmentInfoCard
            appointment={appointment}
            onSave={handleSaveInline}
            saving={saving}
          />
          <AppointmentDetailsCard
            appointment={appointment}
            onSave={handleSaveInline}
            saving={saving}
          />
        </div>
      )}

      {/* Activities Tab with Parity */}
      {activeTab === 'activities' && (
        <AppointmentActivitiesTab
          activities={activities}
          onOpenAddActivity={() => setIsAddActivityModalOpen(true)}
          loading={loadingActivities}
        />
      )}

      {/* Ownership Tab */}
      {activeTab === 'ownership' && (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs font-sans">
          <h3 className="text-base font-bold text-gray-900 mb-4">Record Ownership</h3>
          <AppointmentRecordInfoCard appointment={appointment} />
        </div>
      )}

      {/* Edit All Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Appointment Record</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.clientName}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Contact *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contact}
                    onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Status"
                    options={[
                      { label: 'Scheduled', value: 'Scheduled' },
                      { label: 'Pending', value: 'Pending' },
                      { label: 'Completed', value: 'Completed' },
                      { label: 'Cancelled', value: 'Cancelled' },
                      { label: 'Rescheduled', value: 'Rescheduled' }
                    ]}
                    value={editFormData.status}
                    onChange={(val) => setEditFormData({ ...editFormData, status: val })}
                    placeholder="Select status"
                    searchPlaceholder="Search status (e.g. Pending)..."
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Reference</label>
                  <select
                    value={editFormData.reference}
                    onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  >
                    <option value="Architect">Architect</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Builder">Builder</option>
                    <option value="PMC/Automation Consultant">PMC/Automation Consultant</option>
                    <option value="Walk-in Client">Walk-in Client</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {editFormData.reference !== 'Walk-in Client' && (
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Reference Name</label>
                    <input
                      type="text"
                      value={editFormData.referenceName}
                      onChange={(e) => setEditFormData({ ...editFormData, referenceName: e.target.value })}
                      placeholder="Name of architect/designer/firm"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <SearchableSelect
                    label="Internal Reference"
                    options={userOptions}
                    value={editFormData.internalReference}
                    onChange={(val) => setEditFormData({ ...editFormData, internalReference: val })}
                    placeholder={loadingUsers ? 'Loading team members...' : 'Select or search internal reference...'}
                    searchPlaceholder="Search team member name or role..."
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.appointmentDate}
                    onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    value={editFormData.appointmentTime}
                    onChange={(e) => setEditFormData({ ...editFormData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Requirements</label>
                <textarea
                  rows={3}
                  value={editFormData.requirements}
                  onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Remark</label>
                <textarea
                  rows={2}
                  value={editFormData.remark}
                  onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#007788] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#007788] hover:bg-[#006674] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      <AddAppointmentActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onSubmit={handleAddActivitySubmit}
        submitting={submittingActivity}
      />

      {/* Full Audit History Modal */}
      <AppointmentAuditHistoryModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={allAuditLogs}
        totalLogs={allAuditLogs.length}
      />

      {/* Follow-up Creation / Edit Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setEditingFollowUp(null);
        }}
        onSubmit={handleSaveFollowUp}
        submitting={submittingFollowUp}
        appointment={appointment}
        initialData={editingFollowUp}
      />
    </div>
  );
};

export default AppointmentProfile;
