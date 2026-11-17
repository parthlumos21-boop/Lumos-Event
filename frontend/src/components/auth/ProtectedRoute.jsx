import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If not authorized for this specific role, redirect to appropriate portal
    return role === 'admin'
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/users/all" replace />;
  }

  return children;
};

export default ProtectedRoute;
