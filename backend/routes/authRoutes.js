// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getLearningStats,
  getAllStudents,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  get2FAStatus,
  setup2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  regenerateBackupCodes,
  googleCallback,
  googleFailure
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);

// ── 2FA Public Login Completion Route ─────────────────────────────────────────
// This uses tempToken from login, so normal protect middleware is not used here
router.post('/2fa/verify-login', verify2FALogin);

// ── Google OAuth Routes ───────────────────────────────────────────────────────

// Step 1: Redirect user to Google's OAuth consent screen
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Step 2: Google redirects back here with auth code
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false
  }),
  googleCallback
);

// OAuth failure handler
router.get('/google/failure', googleFailure);

// ── Protected Profile Routes ──────────────────────────────────────────────────
router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  uploadThumbnail.single('avatar'),
  updateProfile
);

router.put('/change-password', protect, changePassword);
router.get('/stats', protect, getLearningStats);

// ── Protected 2FA Routes ──────────────────────────────────────────────────────
router.get('/2fa/status', protect, get2FAStatus);
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify-setup', protect, verify2FASetup);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/backup-codes/regenerate', protect, regenerateBackupCodes);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.get('/students', protect, adminOnly, getAllStudents);

module.exports = router;