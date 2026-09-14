import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../components/layout/Layout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import StaffLayout from '../components/layout/StaffLayout';
import PatientLayout from '../components/layout/PatientLayout';
import DoctorLayout from '../components/layout/DoctorLayout';

// Public pages
import Home from '../pages/Home';
import Doctor from '../pages/Doctor';
import DoctorDetail from '../pages/DoctorDetail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/Error';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Booking from '../pages/Booking';

// Dashboard pages-Admin
import AdminOverview from '../pages/dashboard/admin/AdminOverview';
import StaffOverview from '../pages/dashboard/staff/StaffOverview';
import StaffAppointments from '../pages/dashboard/staff/StaffAppointments';
import StaffPatients from '../pages/dashboard/staff/StaffPatients';
import StaffSettings from '../pages/dashboard/staff/StaffSettings';
import AdminDoctors from '../pages/dashboard/admin/AdminDoctors';
import StaffQueue from '../pages/dashboard/staff/StaffQueue';
import StaffBilling from '../pages/dashboard/staff/StaffBilling';
import AdminReports from '../pages/dashboard/admin/AdminReports';
import AdminSettings from '../pages/dashboard/admin/AdminSettings';
import PatientAppointments from '../pages/dashboard/patient/PatientAppointments';
import PatientHistory from '../pages/dashboard/patient/PatientHistory';

// Dashboard pages — Doctor
import DoctorOverview from '../pages/dashboard/doctor/DoctorOverview';
import DoctorAppointments from '../pages/dashboard/doctor/DoctorAppointments';
import DoctorPatients from '../pages/dashboard/doctor/DoctorPatients';
import DoctorRecords from '../pages/dashboard/doctor/DoctorRecords';
import DoctorSettings from '../pages/dashboard/doctor/DoctorSettings';

import LoadingSpinner from '../components/ui/LoadingSpinner';

const RouteWrapper = ({ children }) => (
  <React.Suspense
    fallback={
      <div className="flex-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </React.Suspense>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    const role = localStorage.getItem('auth_role');
    if (role && role.toUpperCase() !== requiredRole.toUpperCase()) {
      const redirectByRole = {
        ADMIN: '/admin',
        DOCTOR: '/doctor',
        RECEPTIONIST: '/staff',
        PATIENT: '/patient',
      };
      return <Navigate to={redirectByRole[role?.toUpperCase()] || '/login'} replace />;
    }
  }
  return children;
};

const redirectByRole = () => {
  const role = localStorage.getItem('auth_role');
  const map = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    RECEPTIONIST: '/staff',
    PATIENT: '/patient',
  };
  return map[role?.toUpperCase()] || '/admin';
};

const router = createBrowserRouter([
  // ---- Public website ----
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <RouteWrapper><Home /></RouteWrapper> },
      { path: 'doctors', element: <RouteWrapper><Doctor /></RouteWrapper> },
      { path: 'doctors/:id', element: <RouteWrapper><DoctorDetail /></RouteWrapper> },
      { path: 'services', element: <RouteWrapper><Services /></RouteWrapper> },
      { path: 'services/:serviceId', element: <RouteWrapper><ServiceDetail /></RouteWrapper> },
      { path: 'about', element: <RouteWrapper><About /></RouteWrapper> },
      { path: 'contact', element: <RouteWrapper><Contact /></RouteWrapper> },
      { path: 'book', element: <RouteWrapper><Booking /></RouteWrapper> },
      { path: 'home', element: <Navigate to="/" replace /> },
       { path: 'dashboard', element: <Navigate to={redirectByRole()} replace /> },
    ],
  },

  // ---- Admin Dashboard----
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'doctors', element: <AdminDoctors /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  // ---- STAFF / RECEPTIONIST DASHBOARD ----
  {
    path: '/staff',
    element: (
      <ProtectedRoute requiredRole="RECEPTIONIST">
        <StaffLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <StaffOverview /> },
      { path: 'appointments', element: <StaffAppointments /> },
      { path: 'patients', element: <StaffPatients /> },
      { path: 'queue', element: <StaffQueue /> },
      { path: 'billing', element: <StaffBilling /> },
      { path: 'settings', element: <StaffSettings /> },
    ],
  },

  // ---- DOCTOR DASHBOARD ----
  {
    path: '/doctor',
    element: (
      <ProtectedRoute requiredRole="DOCTOR">
        <DoctorLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DoctorOverview /> },
      { path: 'appointments', element: <DoctorAppointments /> },
      { path: 'patients', element: <DoctorPatients /> },
      { path: 'records', element: <DoctorRecords /> },
      { path: 'settings', element: <DoctorSettings /> },
    ],
  },

  // ---- PATIENT DASHBOARD ----
  {
    path: '/patient',
    element: (
      <ProtectedRoute requiredRole="PATIENT">
        <PatientLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <PatientAppointments /> },
      { path: 'history', element: <PatientHistory /> },
    ],
  },

  // ---- Auth ----
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <RouteWrapper>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email or phone</label>
                <input type="text" placeholder="you@example.com" className="input" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input type="password" placeholder="••••••••" className="input" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Login as (demo)</label>
                <select id="demo_role" className="input" defaultValue="DOCTOR">
                  <option value="ADMIN">Administrator</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist / Staff</option>
                  <option value="PATIENT">Patient</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const role = document.getElementById('demo_role').value;
                  localStorage.setItem('auth_token', 'demo_token_' + Date.now());
                  localStorage.setItem('auth_role', role);
                  const dest = { ADMIN: '/admin', DOCTOR: '/doctor', RECEPTIONIST: '/staff', PATIENT: '/patient' }[role] || '/';
                  window.location.href = dest;
                }}
                className="btn btn-primary btn-full"
              >
                Sign in
              </button>
              <p className="text-center text-xs text-slate-400">Demo mode — select a role above, any credentials will sign you in to the corresponding dashboard.</p>            </div>
          </RouteWrapper>
        ),
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
