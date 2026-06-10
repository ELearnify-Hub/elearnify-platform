// pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Mail, Eye, EyeOff,
  ShieldCheck, ArrowLeft, KeyRound
} from 'lucide-react';
import { useAuth }          from '../context/AuthContext';
import { authAPI, twoFactorAPI } from '../services/api';
import GoogleAuthButton     from '../components/GoogleAuthButton';

// ── Step 1: Email/Password Form ───────────────────────────────────────────────
const CredentialsStep = ({ onSuccess, onRequires2FA }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await authAPI.login(formData);

      if (data.requires2FA) {
        // Pass temp token to 2FA step
        onRequires2FA(data.tempToken);
      } else {
        onSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14
          bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
          <Lock size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome back!
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Sign in to continue learning
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium
            text-[var(--text-primary)] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2
              -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="email" name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 border
                border-[var(--border-light)] rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                bg-[var(--surface-1)] text-[var(--text-primary)]
                transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium
              text-[var(--text-primary)]">
              Password
            </label>
            <Link to="/forgot-password"
              className="text-xs text-blue-600 dark:text-blue-400
                hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full border border-[var(--border-light)]
                rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500 bg-[var(--surface-1)]
                text-[var(--text-primary)] transition"
            />
            <button type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700
            disabled:bg-blue-300 text-white font-semibold py-3
            rounded-xl transition-colors text-sm flex items-center
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
              Signing in...
            </>
          ) : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-light)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--surface-1)] px-3 text-xs
            text-[var(--text-muted)] uppercase tracking-wide">
            or continue with
          </span>
        </div>
      </div>

      <GoogleAuthButton label="Continue with Google" />

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Don't have an account?{' '}
        <Link to="/register"
          className="text-blue-600 dark:text-blue-400 font-medium
            hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
};

// ── Step 2: 2FA Verification Form ─────────────────────────────────────────────
const TwoFactorStep = ({ tempToken, onSuccess, onBack }) => {
  const [code,         setCode]         = useState('');
  const [backupCode,   setBackupCode]   = useState('');
  const [useBackup,    setUseBackup]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = useBackup
        ? { tempToken, backupCode: backupCode.trim() }
        : { tempToken, token: code.replace(/\s/g, '') };

      const { data } = await twoFactorAPI.verifyLogin(payload);
      onSuccess(data.token, data.user);

    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  return (
    <>
      {/* Back button */}
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-sm
          text-[var(--text-secondary)] hover:text-blue-600
          dark:hover:text-blue-400 transition-colors mb-6">
        <ArrowLeft size={16} /> Back to login
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16
          bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
          <ShieldCheck size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Two-Factor Auth
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xs mx-auto">
          {useBackup
            ? 'Enter one of your 8-digit backup codes'
            : 'Open your authenticator app and enter the 6-digit code'
          }
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200
            dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3
            rounded-xl mb-5 text-sm text-center">
          ⚠️ {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!useBackup ? (
          /* ── TOTP code input ──────────────────────────────── */
          <div>
            <label className="block text-sm font-medium
              text-[var(--text-primary)] mb-1.5 text-center">
              Authentication Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full text-center text-3xl font-mono font-bold
                tracking-[0.5em] border-2 border-[var(--border-light)]
                rounded-2xl px-4 py-4 focus:outline-none
                focus:border-blue-500 focus:ring-4
                focus:ring-blue-500/10 bg-[var(--surface-1)]
                text-[var(--text-primary)] transition"
            />
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              Code refreshes every 30 seconds
            </p>
          </div>
        ) : (
          /* ── Backup code input ────────────────────────────── */
          <div>
            <label className="block text-sm font-medium
              text-[var(--text-primary)] mb-1.5 text-center">
              Backup Code
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2
                -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={backupCode}
                onChange={e => setBackupCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXXXX"
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-center font-mono
                  tracking-widest text-lg border-2 border-[var(--border-light)]
                  rounded-2xl focus:outline-none focus:border-blue-500
                  focus:ring-4 focus:ring-blue-500/10
                  bg-[var(--surface-1)] text-[var(--text-primary)] transition
                  uppercase"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!useBackup && code.length !== 6) || (useBackup && !backupCode)}
          className="w-full bg-blue-600 hover:bg-blue-700
            disabled:bg-blue-300 dark:disabled:bg-blue-900
            text-white font-semibold py-3 rounded-xl transition-colors
            text-sm flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none"
                viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Verify & Sign In
            </>
          )}
        </button>
      </form>

      {/* Toggle backup code */}
      <button
        onClick={() => { setUseBackup(p => !p); setCode(''); setBackupCode(''); setError(''); }}
        className="w-full mt-4 text-sm text-[var(--text-secondary)]
          hover:text-blue-600 dark:hover:text-blue-400 transition-colors
          flex items-center justify-center gap-2">
        <KeyRound size={14} />
        {useBackup
          ? 'Use authenticator app instead'
          : "Can't access your app? Use a backup code"
        }
      </button>
    </>
  );
};

// ── Main LoginPage ────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [step,      setStep]      = useState('credentials'); // credentials | 2fa
  const [tempToken, setTempToken] = useState('');

  // Handle OAuth errors
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      window.history.replaceState({}, document.title, '/login');
    }
  }, []);

  const handleLoginSuccess = (token, userData) => {
    login(token, userData);
    const redirects = {
      admin:      '/admin',
      instructor: '/instructor',
      student:    '/dashboard'
    };
    navigate(redirects[userData.role] || '/dashboard', { replace: true });
  };

  const handleRequires2FA = (tempToken) => {
    setTempToken(tempToken);
    setStep('2fa');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]
      transition-colors duration-200 flex items-center
      justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        className="bg-[var(--surface-1)] rounded-2xl
          shadow-[var(--shadow-lg)] w-full max-w-md p-8
          border border-[var(--border-light)] transition-colors">

        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.div key="credentials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}>
              <CredentialsStep
                onSuccess={handleLoginSuccess}
                onRequires2FA={handleRequires2FA}
              />
            </motion.div>
          ) : (
            <motion.div key="2fa"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: 20  }}>
              <TwoFactorStep
                tempToken={tempToken}
                onSuccess={handleLoginSuccess}
                onBack={() => setStep('credentials')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;