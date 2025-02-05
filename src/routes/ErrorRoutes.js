// routes/ErrorRoutes.js
import { lazy } from 'react';
import Loadable from '../components/Loadable';
import MinimalLayout from '../layout/MinimalLayout';

const ErrorPage = Loadable(lazy(() => import('../pages/ErrorPage')));

const ErrorRoutes = {
  path: '/',
  element: <MinimalLayout />, // Minimal layout for error pages
  children: [
    {
      path: '*',
      element: <ErrorPage />
    }
  ]
};

export default ErrorRoutes;