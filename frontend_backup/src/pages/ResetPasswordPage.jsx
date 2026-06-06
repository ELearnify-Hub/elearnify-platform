// pages/ResetPasswordPage.jsx
import { useState, useEffect }     from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion }                  from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authAPI }                 from '../services/api';
import { useAuth }                 from '../context/AuthContext';

// ── Password strength helper ──────────────────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6)              score++;
  if (pwd.length >= 10)             score++;
  if (/[A-Z]/.test(pwd))            score++;
  if (/[0-9]/.test(pwd))            score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;
  return score;
};

const STRENGTH_LEVELS = [
  { label: '',            color: 'bg-gray-200 dark:bg-gray-700' },
  { label: 'Weak',        color: 'bg-red-400'    },
  { label: 'Fair',        color: 'bg-orange-400' },
  { label: 'Good',        color: 'bg-yellow-400' },
  { label: 'Strong',      color: 'bg-blue-500'   },
  { label: 'Very Strong', color: 'bg-green-500'  },
];

const ResetPasswordPage = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const [tokenStatus, setTokenStatus] = useState('loading'); // loading | valid | invalid
  const [userEmail,   setUserEmail]   = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');

  // ── Verify token when page loads ──────────────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authAPI.verifyResetToken(token);
        setUserEmail(data.email);
        setTokenStatus('valid');
      } catch {
        setTokenStatus('invalid');
      }
    };
    verify();
  }, [token]);

  const strength     = getStrength(password);
  const strengthInfo = STRENGTH_LEVELS[strength] || STRENGTH_LEVELS[0];

  // ── Handle form submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPass) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, { password });
      login(data.token, data.user);
      setSuccess(true);

      // Redirect after showing success for 2 seconds
      setTimeout(() => {
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (tokenStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center
        bg-gradient-to-br from-blue-50 to-indigo-100
        dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4
            border-blue-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // ── Invalid / Expired token ───────────────────────────────────────────────
  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center
        bg-gradient-to-br from-blue-50 to-indigo-100
        dark:from-gray-900 dark:to-gray-800 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1   }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg
            max-w-md w-full p-8 text-center border border-gray-100
            dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16
            bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
            <XCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Link Expired or Invalid
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            This password reset link has expired or has already been used.
            Reset links are only valid for <strong>10 minutes</strong>.
          </p>
          <Link to="/forgot-password"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white
              font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Request a New Reset Link
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Valid token — show form ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
      dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full
          max-w-md p-8 border border-gray-100 dark:border-gray-800">

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14
                bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                <KeyRound size={24}
                  className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Password
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Resetting password for{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {userEmail}
                </span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0  }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200
                  dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3
                  rounded-xl mb-5 text-sm">
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none
                      focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-gray-600
                      dark:hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all
                            duration-300 ${i <= strength
                              ? strengthInfo.color
                              : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium
                      ${strength <= 1 ? 'text-red-500'
                        : strength <= 2 ? 'text-orange-500'
                        : strength <= 3 ? 'text-yellow-600'
                        : strength <= 4 ? 'text-blue-500'
                        : 'text-green-600'}`}>
                      {strengthInfo.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700
                  dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition
                    ${confirmPass && password !== confirmPass
                      ? 'border-red-400 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-700'
                    }`}
                />
                {confirmPass && password !== confirmPass && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <XCircle size={12} /> Passwords do not match
                  </p>
                )}
                {confirmPass && password === confirmPass && password.length >= 6 && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700
                  disabled:bg-blue-300 dark:disabled:bg-blue-900
                  text-white font-semibold py-3 rounded-xl
                  transition-colors text-sm">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          /* ── Success State ────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1   }}
            className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16
              bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
              <CheckCircle size={32}
                className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Your password has been updated. Redirecting you to your
              dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-4
              border-blue-200 border-t-blue-600 mx-auto" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;