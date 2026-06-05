// pages/ForgotPasswordPage.jsx
import { useState }            from 'react';
import { Link }                from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI }             from '../services/api';

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSent(true); // Always show success (security)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
      dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full
          max-w-md p-8 border border-gray-100 dark:border-gray-800">

        {/* Back link */}
        <Link to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500
            dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
            transition-colors mb-6 group">
          <ArrowLeft size={16}
            className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center
                  w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                  <Mail size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Forgot your password?
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0  }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200
                    dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3
                    rounded-xl mb-5 text-sm flex items-center gap-2">
                  <span>⚠️</span><span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700
                    dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2
                        text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300
                        dark:border-gray-700 bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white rounded-xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        transition"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700
                    disabled:bg-blue-300 dark:disabled:bg-blue-800
                    text-white font-semibold py-3 rounded-xl
                    transition-colors text-sm flex items-center
                    justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none"
                        viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending reset link...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>

          ) : (
            /* ── Success State ──────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1    }}
              className="text-center py-4">

              <div className="inline-flex items-center justify-center
                w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                <CheckCircle size={32}
                  className="text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Check your inbox!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                We've sent a reset link to:
              </p>
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-5">
                {email}
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border
                border-amber-200 dark:border-amber-800 rounded-xl p-4
                text-left mb-6">
                <p className="text-amber-800 dark:text-amber-400 font-semibold
                  text-sm mb-2">
                  ⏰ Important Notes:
                </p>
                <ul className="text-amber-700 dark:text-amber-500 text-xs
                  space-y-1">
                  <li>• The link expires in <strong>10 minutes</strong></li>
                  <li>• Check your <strong>spam/junk</strong> folder too</li>
                  <li>• The link can only be used <strong>once</strong></li>
                </ul>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm text-blue-600 dark:text-blue-400
                  hover:underline">
                Didn't receive it? Send again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remember your password?{' '}
          <Link to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;