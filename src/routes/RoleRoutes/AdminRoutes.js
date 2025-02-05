import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import { checkUserRole } from './checkUserRole';
import { userDefaultPath } from './defaultRolePath';

// ==============================|| ROUTE ADMIN BASE ||============================== //

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    checkUserRole(setIsAdmin);
  }, []);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to={userDefaultPath} />;
};

export default AdminRoute;
