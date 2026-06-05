const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  getProfile,
  getAllStudents,
  forgotPassword,
  verifyResetToken,
  resetPassword
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/auth');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register',                  register);
router.post('/login',                     login);
router.post('/forgot-password',           forgotPassword);
router.get('/verify-reset-token/:token',  verifyResetToken);
router.post('/reset-password/:token',     resetPassword);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.get('/profile',   protect,            getProfile);
router.get('/students',  protect, adminOnly, getAllStudents);

module.exports = router;