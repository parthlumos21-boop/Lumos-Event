import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import GuestProfileTopBar from './GuestProfileTopBar';
import GuestProfileHeader from './GuestProfileHeader';
import GuestProfileTabs from './GuestProfileTabs';
import OverviewTab from './tabs/OverviewTab';
import GuestDetailsTab from './tabs/GuestDetailsTab';
import ActivitiesTab from './tabs/ActivitiesTab';
import OwnershipTab from './tabs/OwnershipTab';
import AddActivityModal from './AddActivityModal';

const GuestProfile = ({ portal = 'admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guest, setGuest] = useState(null);
  const [stats, setStats] = useState({ totalChanges: 0, totalActivities: 0 });
  const [loadingGuest, setLoadingGuest] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');

  // Business activities
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Save states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Fetch Guest Record by ID from MongoDB
  const fetchGuest = useCallback(async () => {
    if (!id) return;
    setLoadingGuest(true);
    setError('');
    try {
      const res = await axiosClient.get(`/guests/${id}`);
      if (res.data?.success && res.data?.guest) {
        setGuest(res.data.guest);
        setStats(res.data.stats || { totalChanges: 0, totalActivities: 0 });
      } else {
        setError('Guest record could not be loaded from database.');
      }
    } catch (err) {
      console.error('Error fetching guest profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch guest record from MongoDB.');
    } finally {
      setLoadingGuest(false);
    }
  }, [id]);

  // Fetch Business Activities from MongoDB
  const fetchActivities = useCallback(async () => {
    if (!id) return;
    setLoadingActivities(true);
    try {
      const res = await axiosClient.get(`/guests/${id}/activities`);
      if (res.data?.success) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  }, [id]);

  // Fetch System Audit Logs from MongoDB
  const fetchAuditLogs = useCallback(async () => {
    if (!id) return;
    setLoadingAuditLogs(true);
    try {
      const res = await axiosClient.get(`/guests/${id}/audit-logs`, { params: { limit: 20 } });
      if (res.data?.success) {
        setAuditLogs(res.data.logs || []);
        setTotalAuditLogs(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingAuditLogs(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchGuest();
    fetchActivities();
    fetchAuditLogs();
  }, [fetchGuest, fetchActivities, fetchAuditLogs]);

  // Save guest details (from Full Details tab or inline Enter-key save)
  const handleSaveGuest = async (payload) => {
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      const res = await axiosClient.put(`/guests/${id}`, payload);
      if (res.data?.success) {
        setGuest(res.data.guest);
        setSaveSuccess('Guest profile and updates committed directly to MongoDB.');
        setTimeout(() => setSaveSuccess(''), 4000);

        // Instantly refresh audit logs and counts from MongoDB
        fetchAuditLogs();
        setStats((prev) => ({
          ...prev,
          totalChanges: prev.totalChanges + (res.data.changesCount || 1)
        }));
      } else {
        setSaveError('Failed to update guest details in database.');
      }
    } catch (err) {
      console.error('Error updating guest:', err);
      setSaveError(err.response?.data?.message || 'Error occurred while saving to MongoDB.');
      setTimeout(() => setSaveError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Log new business activity
  const handleCreateActivity = async (activityData) => {
    setSubmittingActivity(true);
    try {
      const res = await axiosClient.post(`/guests/${id}/activities`, activityData);
      if (res.data?.success) {
        setIsAddActivityOpen(false);
        fetchActivities();
        setStats((prev) => ({
          ...prev,
          totalActivities: prev.totalActivities + 1
        }));
      }
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleBack = () => {
    if (portal === 'admin') {
      navigate('/admin/guests');
    } else {
      navigate('/users/all');
    }
  };

  const handleRefresh = () => {
    fetchGuest();
    fetchActivities();
    fetchAuditLogs();
  };

  if (loadingGuest && !guest) {
    return (
      <div className="min-h-[500px] bg-white flex flex-col items-center justify-center p-8 space-y-3 font-sans">
        <i className="fa-solid fa-rotate fa-spin text-[#007788] text-2xl" />
        <p className="text-xs text-gray-500 font-medium">Loading guest profile & history from MongoDB...</p>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-[400px] bg-white p-8 max-w-lg mx-auto text-center space-y-4 font-sans">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs">
          {error || 'Guest record could not be found in database.'}
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-[#007788] text-white rounded-full text-xs font-semibold cursor-pointer"
        >
          Return to Guest Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 p-2 sm:p-5 lg:p-7">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Bar: Back to Directory & User Status */}
        <GuestProfileTopBar portal={portal} onBack={handleBack} />

        {/* Main Unified White Card Container enclosing all children items */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-5 sm:p-7 space-y-6">
          {/* Profile Header Card */}
          <GuestProfileHeader
            guest={guest}
            stats={stats}
            onEdit={() => setActiveTab('details')}
            onRefresh={handleRefresh}
            loading={loadingGuest}
          />

          {/* Navigation Tabs (Overview, Guest Details, Activities, Ownership) */}
          <GuestProfileTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            stats={stats}
          />

          {/* Active Tab Content */}
          <div className="pt-2">
            {activeTab === 'overview' && (
              <OverviewTab
                guest={guest}
                recentActivities={activities}
                recentAuditLogs={auditLogs}
                onNavigateTab={setActiveTab}
                onSaveInline={handleSaveGuest}
                saving={saving}
              />
            )}

            {activeTab === 'details' && (
              <GuestDetailsTab
                guest={guest}
                onSave={handleSaveGuest}
                saving={saving}
                successMsg={saveSuccess}
                errorMsg={saveError}
              />
            )}

            {activeTab === 'activities' && (
              <ActivitiesTab
                activities={activities}
                onOpenAddActivity={() => setIsAddActivityOpen(true)}
                loading={loadingActivities}
              />
            )}

            {activeTab === 'ownership' && (
              <OwnershipTab
                guest={guest}
                stats={stats}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Business Activity Modal */}
      <AddActivityModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onSubmit={handleCreateActivity}
        submitting={submittingActivity}
      />
    </div>
  );
};

export default GuestProfile;
