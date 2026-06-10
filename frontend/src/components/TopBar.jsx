// components/TopBar.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, Search, X, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { notificationAPI, SERVER_URL } from '../services/api';

// ── Notification Panel ────────────────────────────────────────────────────────
const NotificationPanel = ({ onClose, onUnreadChange }) => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI
      .getAll()
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        onUnreadChange?.(data.unreadCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [onUnreadChange]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );

      setUnreadCount(0);
      onUnreadChange?.(0);
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();

      setNotifications([]);
      setUnreadCount(0);
      onUnreadChange?.(0);
    } catch (error) {
      console.error('Clear notifications error:', error);
    }
  };

  const handleClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationAPI.markOneRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );

        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        onUnreadChange?.(newUnreadCount);
      }

      if (notification.link) {
        navigate(notification.link);
        onClose();
      }
    } catch (error) {
      console.error('Notification click error:', error);
    }
  };

  const TYPE_ICONS = {
    enrollment: '🎓',
    quiz_result: '📝',
    certificate: '🏆',
    course_published: '📚',
    new_review: '⭐',
    system: '🔔'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-lg)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="flex gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
              title="Mark all read"
            >
              <Check size={14} />
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-muted)]">
            <Bell size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleClick(notification)}
              className={`flex w-full items-start gap-3 border-b border-[var(--border-light)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--bg-hover)] ${
                !notification.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-900/10'
                  : ''
              }`}
            >
              <span className="mt-0.5 flex-shrink-0 text-lg">
                {TYPE_ICONS[notification.type] || '🔔'}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    !notification.isRead
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {notification.title}
                </p>

                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">
                  {notification.message}
                </p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {new Date(notification.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )}
                </p>
              </div>

              {!notification.isRead && (
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
              )}
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

// ── Main TopBar ───────────────────────────────────────────────────────────────
const TopBar = ({ title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);

  const displayAvatar = user?.profilePicture || user?.avatar;

  const avatarSrc = displayAvatar
    ? displayAvatar.startsWith('http')
      ? displayAvatar
      : `${SERVER_URL}/${displayAvatar}`
    : '';

  useEffect(() => {
    notificationAPI
      .getAll()
      .then(({ data }) => {
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--border-light)] bg-[var(--surface-1)] px-6 transition-colors duration-200">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden w-52 items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2 md:flex"
        >
          <Search size={15} className="text-[var(--text-muted)]" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
        </form>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifs((prev) => !prev)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            <Bell size={17} className="text-[var(--text-secondary)]" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <NotificationPanel
                onClose={() => setShowNotifs(false)}
                onUnreadChange={setUnreadCount}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-sm font-bold text-white transition-opacity hover:opacity-90">
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
      </div>
    </header>
  );
};

export default TopBar;