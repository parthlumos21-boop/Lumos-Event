import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import DashboardHeader from './DashboardHeader';
import StatOverviewGrid from './StatOverviewGrid';
import QuickAccessCards from './QuickAccessCards';
import RecentRegistrationsList from './RecentRegistrationsList';
import GuestInsightsPanels, { DASHBOARD_FILTER_MAP } from './GuestInsightsPanels';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Scalable O(1) memory dashboard data fetching via MongoDB aggregate endpoint
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const statsRes = await axiosClient.get('/guests/stats').catch(() => ({
        data: {
          totalGuests: 0,
          followUpRequired: 0,
          averageRating: '5.0',
          recentGuests: [],
          interests: [],
          relationships: []
        }
      }));

      const d = statsRes.data || {};
      setStats({
        totalGuests: d.totalGuests ?? 0,
        averageRating: d.averageRating || '5.0',
        followUpRequired: d.followUpRequired ?? 0
      });

      setRecentGuests(Array.isArray(d.recentGuests) ? d.recentGuests : []);
      setInterestsBreakdown(Array.isArray(d.interests) ? d.interests : []);
      setRelationshipsBreakdown(Array.isArray(d.relationships) ? d.relationships : []);
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

      {/* 4. Recent Registrations (Full-width hybrid list/table with top 5 recent guests) */}
      <RecentRegistrationsList
        guests={recentGuests}
        loading={loading}
        onViewAll={handleNavigateGuests}
        onSelectGuest={handleSelectGuest}
      />

      {/* 5. Guest Insights (Left: Interests, Right: Relationship Overview) */}
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
