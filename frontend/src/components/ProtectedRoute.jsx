// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

const ProtectedRoute = ({
  children,
  adminOnly      = false,
  instructorOnly = false
}) => {
  const { isLoggedIn, isAdmin, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (instructorOnly && !['instructor', 'admin'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;