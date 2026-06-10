// pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center
    justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      className="text-center max-w-md">
      <div className="text-8xl mb-6">🎓</div>
      <h1 className="text-6xl font-extrabold text-blue-600
        dark:text-blue-400 mb-2">
        404
      </h1>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
        Page Not Found
      </h2>
      <p className="text-[var(--text-secondary)] mb-8">
        Looks like this lesson doesn't exist.
        Let's get you back on track.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 border border-[var(--border-light)]
            text-[var(--text-secondary)] px-5 py-2.5 rounded-xl text-sm
            hover:bg-[var(--bg-hover)] transition-colors">
          <ArrowLeft size={16} /> Go Back
        </button>
        <Link to="/"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white px-5 py-2.5 rounded-xl text-sm font-medium
            transition-colors">
          <Home size={16} /> Home
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;