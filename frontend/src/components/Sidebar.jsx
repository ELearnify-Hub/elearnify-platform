// components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  User,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  BarChart3,
  PlusCircle,
  Shield,
  Bot,
  Video,
  Info,
  Mail
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../services/api';

// ── Nav items per role ────────────────────────────────────────────────────────
const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'All Courses', path: '/courses' },
  { icon: PlayCircle, label: 'My Learning', path: '/my-courses' },
  { icon: Video, label: 'Live Classes', path: '/live-classes' },
  { icon: Award, label: 'Certificates', path: '/certificates' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Shield, label: 'Security', path: '/security' },
];

const INSTRUCTOR_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor' },
  { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
  { icon: PlayCircle, label: 'My Learning', path: '/my-courses' },
  { icon: Video, label: 'Live Classes', path: '/live-classes' },
  { icon: PlusCircle, label: 'New Course', path: '/instructor/courses/new' },
  { icon: Users, label: 'My Students', path: '/instructor/students' },
  { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Shield, label: 'Security', path: '/security' },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
  { icon: PlusCircle, label: 'Add Course', path: '/admin/courses/new' },
  { icon: Video, label: 'Live Classes', path: '/live-classes' },
  { icon: Users, label: 'Students', path: '/admin/students' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Shield, label: 'Security', path: '/security' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin, user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const isInstructor = user?.role === 'instructor';

  const displayAvatar = user?.profilePicture || user?.avatar;

  const avatarSrc = displayAvatar
    ? displayAvatar.startsWith('http')
      ? displayAvatar
      : `${SERVER_URL}/${displayAvatar}`
    : '';

  const navItems = isAdmin
    ? ADMIN_NAV
    : isInstructor
      ? INSTRUCTOR_NAV
      : STUDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] shadow-[var(--shadow-sm)] flex-shrink-0 z-20 transition-colors duration-200"
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-[var(--text-primary)] text-lg truncate"
              >
                ELearnify
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Nav Items ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active
                  ? 'bg-[var(--sidebar-active)] text-blue-600 dark:text-blue-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
                />
              )}

              <Icon size={20} className="flex-shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── Help links shown after login ───────────────────────── */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-2 space-y-1">
          <Link
            to="/about"
            title={collapsed ? 'About Us' : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
          >
            <Info size={16} />
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>About</motion.span>}</AnimatePresence>
          </Link>
          <Link
            to="/contact"
            title={collapsed ? 'Contact Support' : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
          >
            <Mail size={16} />
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Contact Support</motion.span>}</AnimatePresence>
          </Link>
        </div>
      </div>

      {/* ── User Profile + Logout ─────────────────────────────── */}
      <div className="px-3 py-4 border-t border-[var(--sidebar-border)] space-y-1">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.name}
                </p>

                <p className="text-xs text-[var(--text-secondary)] capitalize">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
        >
          <LogOut size={20} className="flex-shrink-0" />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Collapse Toggle Button ─────────────────────────────── */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-full shadow-[var(--shadow-sm)] flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-[var(--text-secondary)]" />
        ) : (
          <ChevronLeft size={14} className="text-[var(--text-secondary)]" />
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;