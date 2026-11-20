import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LumosDashboardView from '../dashboard/LumosDashboardView';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <LumosDashboardView
      title={user?.name || 'Dashboard'}
      userName={user?.name || 'Dashboard'}
      guestListRoute="/admin/guests"
      newGuestRoute="/admin/form"
      newAppointmentRoute="/admin/appointmentform"
      guestDetailRoutePrefix="/admin/guests"
    />
  );
};

export default AdminDashboard;
