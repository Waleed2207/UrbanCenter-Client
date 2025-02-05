// routes/AdminRoutes.js
import { lazy } from 'react';
import Loadable from '../components/Loadable';
import MinimalLayout from '../layout/MinimalLayout';
import { AdminRoute } from './RoleRoutes';

const Register = Loadable(lazy(() => import('../pages/authentication/Register')));

const AdminRoutes = {
  path: '/',
  element: <MinimalLayout />, // Minimal layout for admin routes
  children: [
    {
      path: 'register',
      element: (
        <AdminRoute>
          <Register />
        </AdminRoute>
      )
    }
  ]
};

export default AdminRoutes;