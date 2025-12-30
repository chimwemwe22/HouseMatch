import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { user } = useContext(AuthContext);

  console.log('ProtectedRoute check:', {
    user: user ? { username: user.username, role: user.role } : null,
    allowedRole
  });

  if (!user) {
    console.log('No user, redirecting to home');
    return <Navigate to="/" />;
  }

  if (user.role !== allowedRole) {
    console.log('Wrong role, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('Access granted to protected route');
  return children;
};

export default ProtectedRoute;