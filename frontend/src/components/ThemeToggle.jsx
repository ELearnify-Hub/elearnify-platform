// components/ThemeToggle.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ size = 'md' }) => {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: { btn: 'w-8 h-8', icon: 14 },
    md: { btn: 'w-10 h-10', icon: 18 },
    lg: { btn: 'w-12 h-12', icon: 22 }
  };

  const { btn, icon } = sizes[size] || sizes.md;

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`${btn} relative flex items-center justify-center overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-colors duration-200 hover:bg-[var(--bg-hover)]`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Sun size={icon} className="text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Moon size={icon} className="text-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
