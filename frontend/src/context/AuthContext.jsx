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
      const token     = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const { data } = await authAPI.getProfile();
          // Merge profile data with stored data to get latest avatar etc.
          const storedUser = JSON.parse(savedUser);
          setUser({ ...storedUser, ...data.user });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ── Login Function ────────────────────────────────────────────────────────
  const login = (token, userData) => {
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
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
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
