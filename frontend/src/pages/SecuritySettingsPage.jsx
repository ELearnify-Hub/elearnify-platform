// pages/SecuritySettingsPage.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import {
  ShieldCheck, ShieldOff, Shield,
  Copy, Check, AlertTriangle,
  RefreshCw, KeyRound, Eye, EyeOff,
  ChevronDown, ChevronUp, Smartphone
} from 'lucide-react';
import { twoFactorAPI } from '../services/api';
import DashboardLayout  from '../layouts/DashboardLayout';
import { useAuth }      from '../context/AuthContext';

// ── Step indicator ────────────────────────────────────────────────────────────
const SetupStep = ({ number, title, active, completed }) => (
  <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-50'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center
      text-sm font-bold flex-shrink-0 transition-colors
      ${completed
        ? 'bg-green-500 text-white'
        : active
          ? 'bg-blue-600 text-white'
          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-light)]'
      }`}>
      {completed ? <Check size={14} /> : number}
    </div>
    <span className={`text-sm font-medium
      ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
      {title}
    </span>
  </div>
);

// ── Backup Codes Display ──────────────────────────────────────────────────────
const BackupCodesDisplay = ({ codes, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1   }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex
        items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface-1)] rounded-2xl w-full max-w-md
        p-6 border border-[var(--border-light)] shadow-[var(--shadow-lg)]">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30
            rounded-xl flex items-center justify-center">
            <KeyRound size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">
              Your Backup Codes
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Save these somewhere safe — shown only once
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border
          border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
          <p className="text-xs text-amber-700 dark:text-amber-400
            flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Each code can only be used <strong>once</strong>.
              Store these in a password manager or print them.
            </span>
          </p>
        </div>

        {/* Codes grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {codes.map((code, i) => (
            <div key={i}
              className="font-mono text-sm bg-[var(--bg-secondary)]
                border border-[var(--border-light)] rounded-xl px-3 py-2.5
                text-center text-[var(--text-primary)] tracking-widest
                font-bold">
              {code}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleCopyAll}
            className="flex-1 flex items-center justify-center gap-2
              border border-[var(--border-light)] text-[var(--text-secondary)]
              py-2.5 rounded-xl text-sm hover:bg-[var(--bg-hover)]
              transition-colors">
            {copied
              ? <><Check size={14} className="text-green-500" /> Copied!</>
              : <><Copy size={14} /> Copy All</>
            }
          </button>
          <button onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
              font-semibold py-2.5 rounded-xl text-sm transition-colors">
            I've Saved These
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── 2FA Setup Wizard ──────────────────────────────────────────────────────────
const Setup2FAWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [qrCode,      setQrCode]      = useState('');
  const [secret,      setSecret]      = useState('');
  const [otpauthUrl,  setOtpauthUrl]  = useState('');
  const [verifyCode,  setVerifyCode]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showSecret,  setShowSecret]  = useState(false);

  // Auto-fetch QR code on mount
  useEffect(() => {
    const fetchSetup = async () => {
      setLoading(true);
      try {
        const { data } = await twoFactorAPI.setup();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setOtpauthUrl(data.otpauthUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };
    fetchSetup();
  }, []);

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await twoFactorAPI.verifySetup({ token: verifyCode });
      setBackupCodes(data.backupCodes);
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Try again.');
      setVerifyCode('');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { number: 1, title: 'Scan QR Code'   },
    { number: 2, title: 'Verify Code'    },
    { number: 3, title: 'Save Backups'   },
  ];

  return (
    <div className="bg-[var(--surface-1)] rounded-2xl border
      border-[var(--border-light)] overflow-hidden
      shadow-[var(--shadow-md)]">

      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-light)]
        bg-[var(--bg-secondary)]">
        <h3 className="font-bold text-[var(--text-primary)] mb-4">
          Set Up Two-Factor Authentication
        </h3>
        {/* Step indicators */}
        <div className="flex items-center gap-4">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center gap-2">
              <SetupStep
                number={step.number}
                title={step.title}
                active={currentStep === step.number}
                completed={currentStep > step.number}
              />
              {idx < STEPS.length - 1 && (
                <div className={`w-8 h-px flex-shrink-0 transition-colors
                  ${currentStep > step.number
                    ? 'bg-green-400'
                    : 'bg-[var(--border-light)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
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

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Scan QR Code ────────────────────────── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              className="space-y-5">

              <div className="flex items-start gap-3 p-4 bg-blue-50
                dark:bg-blue-900/10 border border-blue-200
                dark:border-blue-800 rounded-xl">
                <Smartphone size={20} className="text-blue-600
                  dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">
                    Install an Authenticator App
                  </p>
                  <p className="text-xs opacity-80">
                    Download <strong>Google Authenticator</strong> or{' '}
                    <strong>Authy</strong> on your phone, then scan the QR code below.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12
                    border-4 border-blue-200 border-t-blue-600" />
                </div>
              ) : qrCode ? (
                <div className="flex flex-col items-center gap-4">
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm
                    border border-gray-200">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>

                  {/* Manual entry toggle */}
                  <button
                    onClick={() => setShowSecret(p => !p)}
                    className="flex items-center gap-1.5 text-xs
                      text-[var(--text-secondary)] hover:text-blue-600
                      dark:hover:text-blue-400 transition-colors">
                    {showSecret
                      ? <><EyeOff size={12} /> Hide manual key</>
                      : <><Eye size={12} /> Can't scan? Enter key manually</>
                    }
                  </button>

                  {showSecret && (
                    <div className="w-full bg-[var(--bg-secondary)] border
                      border-[var(--border-light)] rounded-xl p-3 text-center">
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        Manual entry key:
                      </p>
                      <code className="font-mono text-sm font-bold
                        text-[var(--text-primary)] tracking-widest
                        break-all">
                        {secret}
                      </code>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button onClick={onCancel}
                  className="flex-1 border border-[var(--border-light)]
                    text-[var(--text-secondary)] py-2.5 rounded-xl text-sm
                    hover:bg-[var(--bg-hover)] transition-colors">
                  Cancel
                </button>
                <button onClick={() => setCurrentStep(2)}
                  disabled={!qrCode}
                  className="flex-1 bg-blue-600 hover:bg-blue-700
                    disabled:bg-blue-300 text-white font-semibold py-2.5
                    rounded-xl text-sm transition-colors">
                  I've Scanned It →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Verify Code ─────────────────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              className="space-y-5">

              <div className="text-center">
                <p className="text-[var(--text-secondary)] text-sm">
                  Open your authenticator app and enter the
                  <strong className="text-[var(--text-primary)]"> 6-digit code</strong> for ELearnify.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={verifyCode}
                  onChange={e => {
                    setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full text-center text-4xl font-mono font-bold
                    tracking-[0.75em] border-2 border-[var(--border-light)]
                    rounded-2xl px-4 py-5 focus:outline-none
                    focus:border-blue-500 focus:ring-4
                    focus:ring-blue-500/10 bg-[var(--surface-1)]
                    text-[var(--text-primary)] transition"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCurrentStep(1)}
                  className="flex-1 border border-[var(--border-light)]
                    text-[var(--text-secondary)] py-2.5 rounded-xl text-sm
                    hover:bg-[var(--bg-hover)] transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading || verifyCode.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700
                    disabled:bg-blue-300 text-white font-semibold py-2.5
                    rounded-xl text-sm transition-colors flex items-center
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
                      Verifying...
                    </>
                  ) : (
                    <><ShieldCheck size={16} /> Verify Code</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Backup Codes ────────────────────────── */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1   }}
              className="space-y-5">

              <div className="flex items-center gap-3 p-4 bg-green-50
                dark:bg-green-900/10 border border-green-200
                dark:border-green-800 rounded-xl">
                <ShieldCheck size={24} className="text-green-600
                  dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800
                    dark:text-green-400 text-sm">
                    2FA Enabled Successfully! 🎉
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
                    Your account is now protected with two-factor authentication.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                    🔑 Backup Codes
                  </h4>
                  <span className="text-xs text-amber-600 dark:text-amber-400
                    bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                    Save these now!
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  Use these codes to sign in if you lose access to your
                  authenticator app. Each code can only be used once.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {backupCodes.map((code, i) => (
                    <div key={i}
                      className="font-mono text-sm font-bold
                        bg-[var(--bg-secondary)] border border-[var(--border-light)]
                        rounded-xl px-3 py-2.5 text-center
                        text-[var(--text-primary)] tracking-widest">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                  }}
                  className="w-full flex items-center justify-center gap-2
                    border border-[var(--border-light)] text-[var(--text-secondary)]
                    py-2 rounded-xl text-sm hover:bg-[var(--bg-hover)]
                    transition-colors">
                  <Copy size={14} /> Copy All Codes
                </button>
              </div>

              <button onClick={onComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white
                  font-semibold py-3 rounded-xl text-sm transition-colors
                  flex items-center justify-center gap-2">
                <Check size={16} /> Done — I've Saved My Codes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Disable 2FA Form ──────────────────────────────────────────────────────────
const Disable2FAForm = ({ onComplete, onCancel }) => {
  const { user }   = useAuth();
  const [code,     setCode]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const handleDisable = async () => {
    if (!code || code.length !== 6) {
      setError('Enter your 6-digit authenticator code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await twoFactorAPI.disable({ token: code, password });
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface-1)] rounded-2xl border
      border-red-200 dark:border-red-800 p-5
      shadow-[var(--shadow-md)]">

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl
          flex items-center justify-center">
          <ShieldOff size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">
            Disable 2FA
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            This will remove 2FA protection from your account
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
          dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3
          rounded-xl mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {user?.authProvider === 'local' && (
          <div>
            <label className="block text-sm font-medium
              text-[var(--text-primary)] mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your account password"
              className="w-full border border-[var(--border-light)] rounded-xl
                px-4 py-2.5 text-sm focus:outline-none focus:ring-2
                focus:ring-red-500 bg-[var(--surface-1)]
                text-[var(--text-primary)] transition"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium
            text-[var(--text-primary)] mb-1.5">
            Current 2FA Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full text-center font-mono text-2xl font-bold
              tracking-[0.5em] border border-[var(--border-light)] rounded-xl
              px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500
              bg-[var(--surface-1)] text-[var(--text-primary)] transition"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onCancel}
          className="flex-1 border border-[var(--border-light)]
            text-[var(--text-secondary)] py-2.5 rounded-xl text-sm
            hover:bg-[var(--bg-hover)] transition-colors">
          Cancel
        </button>
        <button
          onClick={handleDisable}
          disabled={loading || code.length !== 6}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300
            text-white font-semibold py-2.5 rounded-xl text-sm
            transition-colors flex items-center justify-center gap-2">
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </button>
      </div>
    </div>
  );
};

// ── Main Security Settings Page ───────────────────────────────────────────────
const SecuritySettingsPage = () => {
  const [status,       setStatus]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showSetup,    setShowSetup]    = useState(false);
  const [showDisable,  setShowDisable]  = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState([]);
  const [regenCode,    setRegenCode]    = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError,   setRegenError]   = useState('');

  const fetchStatus = async () => {
    try {
      const { data } = await twoFactorAPI.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchStatus();
  };

  const handleDisableComplete = () => {
    setShowDisable(false);
    fetchStatus();
  };

  const handleRegenerate = async () => {
    if (!regenCode || regenCode.length !== 6) {
      setRegenError('Enter your 6-digit code');
      return;
    }

    setRegenLoading(true);
    setRegenError('');

    try {
      const { data } = await twoFactorAPI.regenerateBackupCodes({
        token: regenCode
      });
      setNewBackupCodes(data.backupCodes);
      setRegenCode('');
    } catch (err) {
      setRegenError(err.response?.data?.message || 'Failed to regenerate');
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Security Settings"
      subtitle="Manage your account security">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── 2FA Status Card ──────────────────────────────────── */}
        <div className="bg-[var(--surface-1)] rounded-2xl border
          border-[var(--border-light)] overflow-hidden
          shadow-[var(--shadow-sm)]">
          <div className="px-5 py-4 border-b border-[var(--border-light)]
            bg-[var(--bg-secondary)]">
            <h2 className="font-bold text-[var(--text-primary)] flex
              items-center gap-2">
              <Shield size={18} className="text-blue-600 dark:text-blue-400" />
              Two-Factor Authentication
            </h2>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4
                  border-blue-200 border-t-blue-600" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center
                    justify-center flex-shrink-0
                    ${status?.twoFactorEnabled
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                    {status?.twoFactorEnabled
                      ? <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
                      : <ShieldOff   size={20} className="text-gray-500 dark:text-gray-400" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-sm">
                      {status?.twoFactorEnabled
                        ? '2FA is Active'
                        : '2FA is Disabled'
                      }
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {status?.twoFactorEnabled
                        ? `${status.backupCodesCount} backup codes remaining`
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (status?.twoFactorEnabled) {
                      setShowDisable(true);
                      setShowSetup(false);
                    } else {
                      setShowSetup(true);
                      setShowDisable(false);
                    }
                  }}
                  className={`text-sm font-semibold px-4 py-2 rounded-xl
                    transition-colors
                    ${status?.twoFactorEnabled
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                  {status?.twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Setup Wizard ─────────────────────────────────────── */}
        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 10 }}>
              <Setup2FAWizard
                onComplete={handleSetupComplete}
                onCancel={() => setShowSetup(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Disable Form ─────────────────────────────────────── */}
        <AnimatePresence>
          {showDisable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 10 }}>
              <Disable2FAForm
                onComplete={handleDisableComplete}
                onCancel={() => setShowDisable(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Backup Codes Management (only if 2FA enabled) ──── */}
        {status?.twoFactorEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            className="bg-[var(--surface-1)] rounded-2xl border
              border-[var(--border-light)] overflow-hidden
              shadow-[var(--shadow-sm)]">
            <button
              onClick={() => setShowRegenModal(p => !p)}
              className="w-full flex items-center justify-between px-5 py-4
                hover:bg-[var(--bg-hover)] transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30
                  rounded-xl flex items-center justify-center">
                  <KeyRound size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">
                    Backup Codes
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {status.backupCodesCount} codes remaining •
                    Regenerate if running low
                  </p>
                </div>
              </div>
              {showRegenModal
                ? <ChevronUp size={18} className="text-[var(--text-muted)]" />
                : <ChevronDown size={18} className="text-[var(--text-muted)]" />
              }
            </button>

            <AnimatePresence>
              {showRegenModal && (
                <motion.div
                  initial={{ height: 0    }}
                  animate={{ height: 'auto' }}
                  exit={{    height: 0    }}
                  className="overflow-hidden border-t border-[var(--border-light)]">
                  <div className="p-5 space-y-4">

                    {newBackupCodes.length > 0 ? (
                      <>
                        <div className="bg-green-50 dark:bg-green-900/10
                          border border-green-200 dark:border-green-800
                          rounded-xl p-3 text-sm text-green-700
                          dark:text-green-400">
                          ✅ New backup codes generated! Save these immediately.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {newBackupCodes.map((code, i) => (
                            <div key={i}
                              className="font-mono text-sm font-bold
                                bg-[var(--bg-secondary)]
                                border border-[var(--border-light)]
                                rounded-xl px-3 py-2.5 text-center
                                text-[var(--text-primary)] tracking-widest">
                              {code}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setNewBackupCodes([])}
                          className="w-full border border-[var(--border-light)]
                            text-[var(--text-secondary)] py-2 rounded-xl text-sm
                            hover:bg-[var(--bg-hover)] transition-colors">
                          Done
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Enter your current 2FA code to generate new backup codes.
                          This will <strong>invalidate all existing backup codes</strong>.
                        </p>

                        {regenError && (
                          <p className="text-red-500 text-sm">⚠️ {regenError}</p>
                        )}

                        <input
                          type="text"
                          inputMode="numeric"
                          value={regenCode}
                          onChange={e => setRegenCode(
                            e.target.value.replace(/\D/g, '').slice(0, 6)
                          )}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full text-center font-mono text-2xl
                            font-bold tracking-[0.5em] border
                            border-[var(--border-light)] rounded-xl px-4
                            py-3 focus:outline-none focus:ring-2
                            focus:ring-blue-500 bg-[var(--surface-1)]
                            text-[var(--text-primary)] transition"
                        />

                        <button
                          onClick={handleRegenerate}
                          disabled={regenLoading || regenCode.length !== 6}
                          className="w-full flex items-center justify-center
                            gap-2 bg-amber-500 hover:bg-amber-600
                            disabled:bg-amber-300 text-white font-semibold
                            py-2.5 rounded-xl text-sm transition-colors">
                          <RefreshCw size={15} />
                          {regenLoading
                            ? 'Generating...'
                            : 'Generate New Codes'
                          }
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Security Tips ─────────────────────────────────────── */}
        <div className="bg-[var(--surface-1)] rounded-2xl border
          border-[var(--border-light)] p-5 shadow-[var(--shadow-sm)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3
            flex items-center gap-2 text-sm">
            💡 Security Tips
          </h3>
          <ul className="space-y-2">
            {[
              'Use a unique, strong password for your ELearnify account',
              'Enable 2FA for maximum account protection',
              'Store backup codes in a secure password manager',
              'Never share your 2FA codes or backup codes with anyone',
              'Sign out from shared or public devices after use'
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs
                text-[var(--text-secondary)]">
                <Check size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecuritySettingsPage;