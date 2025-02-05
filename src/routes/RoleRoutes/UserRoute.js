import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import { checkUserRole } from './checkUserRole';
import { adminDefaultPath } from './defaultRolePath';

// ==============================|| ROUTE USER BASE ||============================== //

const UserRoute = ({ children }) => {
  const [isUser, setIsUser] = useState(null);

  useEffect(() => {
    checkUserRole((isAdmin) => setIsUser(!isAdmin));
  }, []);

  if (isUser === null) {
    return <div>Loading...</div>;
  }

  return isUser ? children : <Navigate to={adminDefaultPath} />;
};

export default UserRoute;
