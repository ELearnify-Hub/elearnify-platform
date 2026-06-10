// routes/twoFactorRoutes.js
const express = require('express');
const router  = express.Router();

const {
  setup2FA,
  verifySetup,
  disable2FA,
  verifyLogin,
  get2FAStatus,
  regenerateBackupCodes
} = require('../controllers/twoFactorController');

const { protect } = require('../middleware/auth');

// ── Setup flow (requires full auth) ──────────────────────────────────────────
router.get ('/status',                  protect, get2FAStatus);
router.post('/setup',                   protect, setup2FA);
router.post('/verify-setup',            protect, verifySetup);
router.delete('/disable',               protect, disable2FA);
router.post('/regenerate-backup-codes', protect, regenerateBackupCodes);

// ── Login flow (uses temp token — no protect middleware) ──────────────────────
router.post('/verify-login', verifyLogin);

module.exports = router;