// routes/authRoutes.js
const express  = require('express');
const router   = express.Router();
const passport = require('../config/passport');

const {
  register,
  login,
  getProfile,
  getAllStudents,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  googleCallback,
  googleFailure
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/auth');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register',                 register);
router.post('/login',                    login);
router.post('/forgot-password',          forgotPassword);
router.get ('/verify-reset-token/:token',verifyResetToken);
router.post('/reset-password/:token',    resetPassword);

// ── Google OAuth Routes ───────────────────────────────────────────────────────

// Step 1: Redirect user to Google's OAuth consent screen
// scope: we request email and profile (name, picture)
router.get('/google',
  passport.authenticate('google', {
    scope:  ['profile', 'email'],
    prompt: 'select_account'
    // prompt: 'select_account' forces Google to show account picker
    // even if user is already logged in — better UX
  })
);

// Step 2: Google redirects back here with auth code
// Passport exchanges code for profile, runs our verify callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session:         false
    // session: false because we use JWT, not sessions
  }),
  googleCallback
);

// OAuth failure handler
router.get('/google/failure', googleFailure);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.get('/profile',  protect,            getProfile);
router.get('/students', protect, adminOnly, getAllStudents);

module.exports = router;