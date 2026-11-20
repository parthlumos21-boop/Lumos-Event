import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public & Landing Components
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';

// Admin Components & Layout
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminGuests from './components/admin/AdminGuests';
import AdminEmployees from './components/admin/AdminEmployees';

// User Components & Layout
import UserLayout from './components/layout/UserLayout';
import UserGuestList from './components/users/UserGuestList';
import UserDashboard from './components/users/UserDashboard';

// Guest Profile & Audit Management
import GuestProfile from './components/guest/GuestProfile';

// Reusable Form
import ReusableEventForm from './components/form/ReusableEventForm';

// Appointments
import AppointmentForm from './components/appointments/AppointmentForm';
import AppointmentList from './components/appointments/AppointmentList';
import AppointmentProfile from './components/appointments/AppointmentProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Form Route (Accessible directly by anyone without login) */}
          <Route path="/form" element={<ReusableEventForm portalType="public" />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes: Only accessible by role: admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="guests/:id" element={<GuestProfile portal="admin" />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="form" element={<ReusableEventForm portalType="admin" />} />
            <Route path="appointmentform" element={<AppointmentForm portalType="admin" />} />
            <Route path="appointments" element={<AppointmentList portal="admin" />} />
            <Route path="appointments/:id" element={<AppointmentProfile portal="admin" />} />
          </Route>

          {/* User Routes: Accessible by authenticated users/employees/admin */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee', 'user']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="all" element={<UserGuestList />} />
            <Route path="guests/:id" element={<GuestProfile portal="user" />} />
            <Route path="form" element={<ReusableEventForm portalType="user" />} />
            <Route path="appointmentform" element={<AppointmentForm portalType="user" />} />
            <Route path="appointments" element={<AppointmentList portal="user" />} />
            <Route path="appointments/:id" element={<AppointmentProfile portal="user" />} />
          </Route>

          {/* User Portal Alternative Route */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee', 'user']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="all" element={<UserGuestList />} />
            <Route path="guests/:id" element={<GuestProfile portal="user" />} />
            <Route path="form" element={<ReusableEventForm portalType="user" />} />
            <Route path="appointmentform" element={<AppointmentForm portalType="user" />} />
            <Route path="appointments" element={<AppointmentList portal="user" />} />
            <Route path="appointments/:id" element={<AppointmentProfile portal="user" />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
