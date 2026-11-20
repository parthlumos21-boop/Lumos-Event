import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LumosDashboardView from '../dashboard/LumosDashboardView';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <LumosDashboardView
      title={user?.name || 'Dashboard'}
      userName={user?.name || 'Dashboard'}
      guestListRoute="/users/all"
      newGuestRoute="/users/form"
      newAppointmentRoute="/user/appointmentform"
      guestDetailRoutePrefix="/users/guests"
    />
  );
};

export default UserDashboard;
