// components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Helper: highlight active link
  const isActive = (path) =>
    location.pathname === path
      ? 'text-white force-white font-semibold border-b-2 border-white'
      : 'text-blue-100 hover:text-white transition-colors';

  return (
    <nav className="bg-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1.5">
              <svg
                className="w-6 h-6 text-blue-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>

            <span className="text-white force-white text-xl font-bold tracking-wide">
              ELearnify
            </span>
          </Link>

          {/* ── Desktop Links ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={isActive('/')}>
              Home
            </Link>

            <Link to="/courses" className={isActive('/courses')}>
              Courses
            </Link>

            {isLoggedIn && !isAdmin && (
              <Link to="/my-courses" className={isActive('/my-courses')}>
                My Learning
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className={isActive('/admin')}>
                Dashboard
              </Link>
            )}
          </div>

          {/* ── Desktop Auth Buttons ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-blue-100 hover:text-white transition-colors px-3 py-1"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">

                {/* User avatar + name */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <span className="text-blue-100 text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white force-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ───────────────────────────────── */}
          <button
            className="md:hidden text-white force-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white py-1"
            >
              Home
            </Link>

            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-blue-100 hover:text-white py-1"
            >
              Courses
            </Link>

            {isLoggedIn && !isAdmin && (
              <Link
                to="/my-courses"
                onClick={() => setMenuOpen(false)}
                className="text-blue-100 hover:text-white py-1"
              >
                My Learning
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-blue-100 hover:text-white py-1"
              >
                Dashboard
              </Link>
            )}

            <div className="pt-2 border-t border-blue-600 space-y-3">
              <ThemeToggle />

              {!isLoggedIn ? (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-blue-100 hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-blue-100 hover:text-white"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-200"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;