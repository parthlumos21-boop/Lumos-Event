import React from 'react';
import { Navigate } from 'react-router-dom';

const UserDashboard = () => {
  // Direct default user view to all guests table
  return <Navigate to="/users/all" replace />;
};

export default UserDashboard;
