 // context/AuthContext.jsx
// Global authentication state manager
// Any component in the app can read: user, isLoggedIn, role
// And call: login(), logout()

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Step 1: Create the context object
const AuthContext = createContext(null);

// Step 2: Create the Provider component
// Wrap the entire app in this so all components can access auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking if user is already logged in

  // ── On App Load: Check if user is already logged in ──────────────────────
  // When the page refreshes, React state is lost
  // But localStorage persists — so we restore state from it
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid by hitting /profile
          const { data } = await authAPI.getProfile();
          setUser(data.user);
        } catch (error) {
          // Token expired or invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false); // Done checking
    };

    initializeAuth();
  }, []);

  // ── Login Function ────────────────────────────────────────────────────────
  const login = (token, userData) => {
    // Save to localStorage so it persists after page refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // ── Logout Function ───────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ── Helper Values ─────────────────────────────────────────────────────────
  const isLoggedIn = !!user;                    // true if user exists
  const isAdmin    = user?.role === 'admin';    // true if user is admin
  const isStudent  = user?.role === 'student';  // true if user is student

  // ── Provide Values to All Children ───────────────────────────────────────
  const value = {
    user,
    loading,
    isLoggedIn,
    isAdmin,
    isStudent,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until we've checked localStorage */}
      {/* This prevents a flash of "logged out" UI on refresh */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Step 3: Custom hook for easy access
// Instead of: const { user } = useContext(AuthContext)
// We write:   const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;
