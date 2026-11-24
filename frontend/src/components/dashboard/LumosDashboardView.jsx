import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import DashboardHeader from './DashboardHeader';
import StatOverviewGrid from './StatOverviewGrid';
import QuickAccessCards from './QuickAccessCards';
import UpcomingReminders from './UpcomingReminders';
import RecentFeedback from './RecentFeedback';
import GuestInsightsPanels, { DASHBOARD_FILTER_MAP } from './GuestInsightsPanels';
import appointmentFollowUpService from '../../services/appointmentFollowUpService';

const LumosDashboardView = ({
  title = 'Dashboard',
  userName = 'Dashboard',
  guestListRoute = '/admin/guests',
  newGuestRoute = '/admin/form',
  newAppointmentRoute = '/admin/appointmentform',
  guestDetailRoutePrefix = '/admin/guests'
}) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGuests: 0,
    averageRating: '5.0',
    followUpRequired: 0
  });
  const [recentGuests, setRecentGuests] = useState([]);
  const [interestsBreakdown, setInterestsBreakdown] = useState([]);
  const [relationshipsBreakdown, setRelationshipsBreakdown] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Scalable O(1) memory dashboard data fetching via MongoDB aggregate endpoints
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, aptStatsRes, remindersRes] = await Promise.all([
        axiosClient.get('/guests/stats').catch(() => ({
          data: {
            totalGuests: 0,
            followUpRequired: 0,
            averageRating: '5.0',
            recentGuests: [],
            interests: [],
            relationships: []
          }
        })),
        axiosClient.get('/appointments/stats').catch(() => ({
          data: {
            totalAppointments: 0,
            scheduledCount: 0,
            pendingCount: 0,
            completedCount: 0,
            cancelledCount: 0,
            rescheduledCount: 0,
            todayCount: 0,
            upcomingCount: 0,
            recentAppointments: [],
            references: [],
            statusBreakdown: []
          }
        })),
        appointmentFollowUpService.getUpcomingReminders().catch(() => ({
          success: false,
          totalPendingCount: 0,
          reminders: []
        }))
      ]);

      const d = statsRes.data || {};
      setStats({
        totalGuests: d.totalGuests ?? 0,
        averageRating: d.averageRating || '5.0',
        followUpRequired: d.followUpRequired ?? 0
      });

      setRecentGuests(Array.isArray(d.recentGuests) ? d.recentGuests : []);
      setInterestsBreakdown(Array.isArray(d.interests) ? d.interests : []);
      setRelationshipsBreakdown(Array.isArray(d.relationships) ? d.relationships : []);

      if (remindersRes && Array.isArray(remindersRes.reminders)) {
        setUpcomingReminders(remindersRes.reminders);
        setPendingRemindersCount(remindersRes.totalPendingCount ?? remindersRes.reminders.length);
      } else {
        setUpcomingReminders([]);
        setPendingRemindersCount(0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Navigation Handlers
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleNavigateGuests = () => {
    navigate(guestListRoute);
  };

  const handleNavigateForm = () => {
    navigate(newGuestRoute);
  };

  const handleNavigateAppointment = () => {
    navigate(newAppointmentRoute);
  };

  const appointmentsRoute = guestListRoute.startsWith('/admin') ? '/admin/appointments' : '/user/appointments';

  const handleViewAllReminders = () => {
    navigate(appointmentsRoute);
  };

  const handleSelectReminder = (reminder) => {
    if (reminder?.appointmentId) {
      navigate(`${appointmentsRoute}/${reminder.appointmentId}`);
    } else {
      navigate(appointmentsRoute);
    }
  };

  const handleSelectGuest = (guestId) => {
    navigate(`${guestDetailRoutePrefix}/${guestId}`);
  };

  // Interactive Filter Navigation from Insights
  const handleSelectInterest = (label) => {
    const filterValues = DASHBOARD_FILTER_MAP.interests[label] || [label];
    navigate(`${guestListRoute}?interest=${encodeURIComponent(label)}`, {
      state: { filterInterests: filterValues }
    });
  };

  const handleSelectRelationship = (label) => {
    const filterValues = DASHBOARD_FILTER_MAP.relationships[label] || [label];
    navigate(`${guestListRoute}?relationship=${encodeURIComponent(label)}`, {
      state: { filterRelationships: filterValues }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans pb-10">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        title={title}
        onNewGuest={handleNavigateForm}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* 2. Statistics Overview (4 cards row) */}
      <StatOverviewGrid
        stats={stats}
        loading={loading}
        onNavigateGuests={handleNavigateGuests}
        onNavigateForm={handleNavigateForm}
      />

      {/* 3. Quick Access (3 action cards) */}
      <QuickAccessCards
        onNavigateGuests={handleNavigateGuests}
        onNavigateForm={handleNavigateForm}
        onNavigateAppointment={handleNavigateAppointment}
      />

      {/* 4. Upcoming Reminders – New Section */}
      <UpcomingReminders
        reminders={upcomingReminders}
        pendingCount={pendingRemindersCount}
        loading={loading}
        onViewAll={handleViewAllReminders}
        onSelectReminder={handleSelectReminder}
      />

      {/* 5. Recent Feedback (Vertically stacked compact cards) */}
      <RecentFeedback
        guests={recentGuests}
        loading={loading}
        onViewAll={handleNavigateGuests}
        onSelectGuest={handleSelectGuest}
      />

      {/* 6. Guest Insights (Left: Interests, Right: Relationship Overview) */}
      <GuestInsightsPanels
        interests={interestsBreakdown}
        relationships={relationshipsBreakdown}
        totalCount={stats.totalGuests}
        onSelectInterest={handleSelectInterest}
        onSelectRelationship={handleSelectRelationship}
      />
    </div>
  );
};

export default LumosDashboardView;
