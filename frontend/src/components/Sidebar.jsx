// components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlayCircle, User,
  Award, Settings, LogOut, ChevronLeft,
  ChevronRight, GraduationCap, Users, BarChart3,
  PlusCircle, Menu
} from 'lucide-react';
import { useAuth }  from '../context/AuthContext';

// ── Nav items per role ────────────────────────────────────────────────────────
const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard'         },
  { icon: BookOpen,        label: 'All Courses',    path: '/courses'           },
  { icon: PlayCircle,      label: 'My Learning',    path: '/my-courses'        },
  { icon: Award,           label: 'Certificates',   path: '/certificates'      },
  { icon: User,            label: 'Profile',        path: '/profile'           },
];

const INSTRUCTOR_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/instructor'          },
  { icon: BookOpen,        label: 'My Courses',  path: '/instructor/courses'  },
  { icon: PlusCircle,      label: 'New Course',  path: '/instructor/courses/new' },
  { icon: Users,           label: 'My Students', path: '/instructor/students' },
  { icon: BarChart3,       label: 'Analytics',   path: '/instructor/analytics'},
  { icon: User,            label: 'Profile',     path: '/instructor/profile'  },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Overview',       path: '/admin'             },
  { icon: BookOpen,        label: 'Courses',        path: '/admin/courses'     },
  { icon: PlusCircle,      label: 'Add Course',     path: '/admin/courses/new' },
  { icon: Users,           label: 'Students',       path: '/admin/students'    },
  { icon: BarChart3,       label: 'Analytics',      path: '/admin/analytics'   },
  { icon: Settings,        label: 'Settings',       path: '/admin/settings'    },
];

const Sidebar = () => {
  const [collapsed,  setCollapsed]  = useState(false);
  const { isAdmin, user, logout }   = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const isInstructor = user?.role === 'instructor';
  const navItems = isAdmin
    ? ADMIN_NAV
    : isInstructor
      ? INSTRUCTOR_NAV
      : STUDENT_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0 z-20">

      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-gray-900 dark:text-white text-lg truncate">
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
            <Link key={path} to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${active
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}>

              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6
                    bg-blue-600 rounded-r-full"
                />
              )}

              <Icon size={20} className="flex-shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{    opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium truncate">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile + Logout ─────────────────────────────── */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
          bg-gray-50 dark:bg-gray-800 ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center
            justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}
                className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
            transition-colors text-sm font-medium">
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{    opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Collapse Toggle Button ─────────────────────────────── */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700 rounded-full shadow-sm
          flex items-center justify-center hover:bg-gray-50
          dark:hover:bg-gray-800 transition-colors">
        {collapsed
          ? <ChevronRight size={14} className="text-gray-500" />
          : <ChevronLeft  size={14} className="text-gray-500" />
        }
      </button>
    </motion.aside>
  );
};

export default Sidebar;