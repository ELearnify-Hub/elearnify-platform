// components/ThemeToggle.jsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        transition-colors border border-gray-200 dark:border-gray-700"
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}>
      <AnimatePresence mode="wait">
        {isLight ? (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon size={18} className="text-blue-600 dark:text-blue-400" />
          </motion.div>
        ) : (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun size={18} className="text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
