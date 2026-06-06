// components/TopBar.jsx
import { Bell, Search } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import ThemeToggle  from './ThemeToggle';

const TopBar = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200
      dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">

      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100
          dark:bg-gray-800 rounded-xl px-3 py-2 w-56">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-600 dark:text-gray-300
              placeholder-gray-400 outline-none w-full"
          />
        </div>

        {/* Notification bell */}
        <button className="relative w-10 h-10 rounded-xl flex items-center
          justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800
          dark:hover:bg-gray-700 transition-colors">
          <Bell size={18} className="text-gray-600 dark:text-gray-300" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500
            rounded-full border-2 border-white dark:border-gray-900" />
        </button>

        {/* Dark mode toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center
          justify-center text-white text-sm font-bold cursor-pointer
          hover:bg-blue-700 transition-colors">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default TopBar;