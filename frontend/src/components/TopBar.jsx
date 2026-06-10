// components/TopBar.jsx
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { SERVER_URL } from '../services/api';

const TopBar = ({ title, subtitle }) => {
  const { user } = useAuth();

  const displayAvatar = user?.profilePicture || user?.avatar;
  const avatarSrc = displayAvatar
    ? displayAvatar.startsWith('http')
      ? displayAvatar
      : `${SERVER_URL}/${displayAvatar}`
    : '';

  return (
    <header className="h-16 bg-[var(--surface-1)] border-b border-[var(--border-light)] flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">

      {/* Left: Page title */}
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

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--bg-secondary)] rounded-xl px-3 py-2 w-56 border border-[var(--border-light)]">
          <Search size={16} className="text-[var(--text-secondary)]" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-full"
          />
        </div>

        {/* Notification bell */}
        <button className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-light)] transition-colors">
          <Bell size={18} className="text-[var(--text-secondary)]" />

          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--surface-1)]" />
        </button>

        {/* Dark mode toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">
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
      </div>
    </header>
  );
};

export default TopBar;