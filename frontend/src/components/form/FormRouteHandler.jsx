import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Loader';

const FormRouteHandler = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/form" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/form" replace />;
  }

  return <Navigate to="/users/form" replace />;
};

export default FormRouteHandler;
