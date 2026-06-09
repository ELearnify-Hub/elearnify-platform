// components/GoogleAuthButton.jsx
// Reusable "Continue with Google" button
// Used on both Login and Register pages

import { motion } from 'framer-motion';

const BACKEND_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const GoogleAuthButton = ({ label = 'Continue with Google', disabled = false }) => {
  const handleGoogleAuth = () => {
    if (disabled) return;

    // VITE_SERVER_URL should be:
    // Production: https://elearning-backend-76wm.onrender.com/api
    // Local:      http://localhost:5000/api
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleAuth}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      className="w-full flex items-center justify-center gap-3
        bg-white dark:bg-gray-800 border-2 border-gray-200
        dark:border-gray-700 hover:border-gray-300
        dark:hover:border-gray-600 hover:bg-gray-50
        dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300
        font-semibold py-3 px-4 rounded-xl transition-all text-sm
        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
        hover:shadow-md"
    >
      {/* Google Logo SVG */}
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>

      {label}
    </motion.button>
  );
};

export default GoogleAuthButton;