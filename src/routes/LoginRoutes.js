// routes/LoginRoutes.js
import { lazy } from 'react';
import Loadable from '../components/Loadable';
import MinimalLayout from '../layout/MinimalLayout';

const Login = Loadable(lazy(() => import('../pages/authentication/Login')));

const LoginRoutes = {
  path: '/',
  element: <MinimalLayout />, // Minimal layout for authentication
  children: [
    {
      path: 'login',
      element: <Login />
    }
  ]
};

export default LoginRoutes;