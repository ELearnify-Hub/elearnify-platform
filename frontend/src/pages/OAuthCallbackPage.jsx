// pages/OAuthCallbackPage.jsx
// This page handles the redirect from our backend after Google OAuth
// URL format: /auth/callback?token=JWT&user=ENCODED_USER_JSON

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const OAuthCallbackPage = () => {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const { login }         = useAuth();
  const [status, setStatus] = useState('processing');
  // status: 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Extract token and user from URL params
        const token    = searchParams.get('token');
        const userStr  = searchParams.get('user');
        const error    = searchParams.get('error');

        // ── Handle error from backend ────────────────────────────────────────
        if (error) {
          const errorMessages = {
            oauth_failed:       'Google authentication failed. Please try again.',
            google_auth_failed: 'Could not authenticate with Google.',
            server_error:       'A server error occurred. Please try again.'
          };
          setErrorMsg(errorMessages[error] || 'Authentication failed.');
          setStatus('error');
          return;
        }

        // ── Validate required params ─────────────────────────────────────────
        if (!token || !userStr) {
          setErrorMsg('Invalid authentication response. Please try again.');
          setStatus('error');
          return;
        }

        // ── Parse user data ──────────────────────────────────────────────────
        const userData = JSON.parse(decodeURIComponent(userStr));

        // ── Store in AuthContext + localStorage ──────────────────────────────
        login(token, userData);
        setStatus('success');

        // ── Clean URL (remove token from browser history) ───────────────────
        // This is a security measure — tokens shouldn't live in URLs
        window.history.replaceState({}, document.title, '/');

        // ── Redirect based on role ───────────────────────────────────────────
        setTimeout(() => {
          const roleRedirects = {
            admin:      '/admin',
            instructor: '/instructor',
            student:    '/dashboard'
          };
          navigate(roleRedirects[userData.role] || '/dashboard', {
            replace: true
          });
        }, 1500); // Brief delay to show success state

      } catch (err) {
        console.error('OAuth callback error:', err);
        setErrorMsg('Failed to process authentication. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
      dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1   }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-10
          text-center max-w-sm w-full border border-gray-100
          dark:border-gray-800">

        {/* Processing */}
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-14 w-14 border-4
              border-blue-200 border-t-blue-600 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Signing you in...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Completing Google authentication
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30
              rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to ELearnify!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Redirecting you to your dashboard...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat:   Infinity,
                    duration: 1.2,
                    delay:    i * 0.2
                  }}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30
              rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-red-500 dark:text-red-400 text-sm mb-5">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
                px-6 py-2.5 rounded-xl transition-colors text-sm">
              Back to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OAuthCallbackPage;