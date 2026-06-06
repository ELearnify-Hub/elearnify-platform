// components/ThemeToggle.jsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{    rotate:  90, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Sun size={18} className="text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div key="moon"
            initial={{ rotate: 90,  opacity: 0 }}
            animate={{ rotate: 0,   opacity: 1 }}
            exit={{    rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Moon size={18} className="text-blue-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;