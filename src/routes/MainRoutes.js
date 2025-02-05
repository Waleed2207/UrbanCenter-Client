// routes/MainRoutes.js
import { lazy } from 'react';
import Loadable from '../components/Loadable';
import DashboardLayout from '../layout/MainLayout';
import { Navigate } from 'react-router-dom';

import { UserRoute } from './RoleRoutes';

// Lazy-loaded components
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));
const Reports = Loadable(lazy(() => import('../pages/Reports')));
const CitizenInquiries = Loadable(lazy(() => import('../pages/CitizenInquiries')));
const UserManagement = Loadable(lazy(() => import('../pages/UserManagement')));

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />, // Main layout for logged-in users
  children: [
    {
      path: '/',
      element: (
        <UserRoute>
          <Dashboard />
        </UserRoute>
      )
    },
    {
      path: 'reports',
      element: (
        <UserRoute>
          <Reports />
        </UserRoute>
      )
    },
    {
      path: 'citizen-inquiries',
      element: (
        <UserRoute>
          <CitizenInquiries />
        </UserRoute>
      )
    },
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
    },
    {
      path: 'user-management',
      element: (
        <UserRoute>
          <UserManagement />
        </UserRoute>
      )
    }
  ]
};

export default MainRoutes;