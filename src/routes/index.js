// AppRoutes.js (Handles application-level routing)
import { useRoutes } from 'react-router-dom';

// Importing custom routes
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import AdminRoutes from './AdminRoutes';
import ErrorRoutes from './ErrorRoutes';

const AppRoutes = () => {
  return useRoutes([MainRoutes, LoginRoutes, AdminRoutes, ErrorRoutes]);
};

export default AppRoutes;