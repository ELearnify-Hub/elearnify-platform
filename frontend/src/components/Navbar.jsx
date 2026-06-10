// components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { SERVER_URL } from '../services/api';

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayAvatar = user?.profilePicture || user?.avatar;
  const avatarSrc = displayAvatar
    ? displayAvatar.startsWith('http')
      ? displayAvatar
      : `${SERVER_URL}/${displayAvatar}`
    : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinkClass = (path) => {
    const active = location.pathname === path;
    return `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--brand-light)] text-[var(--brand-text)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
    }`;
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--navbar-border)] bg-[var(--navbar-bg)]/95 shadow-[var(--shadow-sm)] backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[var(--shadow-sm)]">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              ELearnify
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/courses" className={navLinkClass('/courses')}>Courses</Link>

            {isLoggedIn && !isAdmin && user?.role !== 'instructor' && (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                My Learning
              </Link>
            )}

            {isLoggedIn && user?.role === 'instructor' && (
              <Link to="/instructor" className={navLinkClass('/instructor')}>
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                Admin
              </Link>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-600 text-sm font-bold text-white">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.name || 'User'}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="hidden max-w-28 truncate text-sm font-medium text-[var(--text-primary)] lg:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="space-y-1 border-t border-[var(--border-light)] pb-4 pt-3">
                <Link to="/" onClick={() => setMenuOpen(false)} className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/courses" onClick={() => setMenuOpen(false)} className={navLinkClass('/courses')}>
                  Courses
                </Link>

                {isLoggedIn && user?.role === 'student' && (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass('/dashboard')}>
                    My Learning
                  </Link>
                )}

                {isLoggedIn && user?.role === 'instructor' && (
                  <Link to="/instructor" onClick={() => setMenuOpen(false)} className={navLinkClass('/instructor')}>
                    Dashboard
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className={navLinkClass('/admin')}>
                    Admin
                  </Link>
                )}

                <div className="border-t border-[var(--border-light)] pt-3">
                  {!isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] py-2 text-center text-sm font-medium text-[var(--text-primary)]"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl bg-blue-600 py-2 text-center text-sm font-semibold text-white"
                      >
                        Register
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
