// components/ProtectedRoute.jsx
// A wrapper component that guards pages from unauthorized access
// If user is not logged in → redirect to /login
// If adminOnly is true and user is not admin → redirect to /

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  // Not logged in at all → go to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route but user is not admin → go to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // All checks passed → render the page
  return children;
};

export default ProtectedRoute;