// controllers/twoFactorController.js
// Handles all Two-Factor Authentication operations

const speakeasy = require('speakeasy');
const QRCode    = require('qrcode');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');

// ── Helper: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ── Helper: Generate temp token (used during 2FA login step) ─────────────────
// This token only allows the user to complete 2FA verification
// It cannot be used to access protected routes
const generateTempToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: '2fa_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }  // Short expiry — user must complete 2FA in 10 min
  );
};

// ── Helper: Generate backup codes ────────────────────────────────────────────
const generateBackupCodes = async () => {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < 8; i++) {
    // Generate a random 10-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    codes.push(code);

    // Hash before storing (same security as passwords)
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(code, salt);
    hashedCodes.push(hashed);
  }

  return { codes, hashedCodes };
};

// ─────────────────────────────────────────────────────────────────────────────
//  SETUP FLOW
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/2fa/setup ───────────────────────────────────────────────
// @desc   Generate a new 2FA secret and QR code for the user
// @access Private
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled on your account'
      });
    }

    // Generate a new TOTP secret
    // speakeasy creates a base32-encoded secret compatible with all
    // authenticator apps (Google Authenticator, Authy, etc.)
    const secret = speakeasy.generateSecret({
      name:   `ELearnify (${user.email})`,
      // The name appears in the authenticator app
      // Format: "AppName (user@email.com)"
      issuer: 'ELearnify',
      length: 32          // 32 bytes = stronger than the default 20
    });

    // Save secret to user (not yet enabled — user must verify first)
    // We use .select('+twoFactorSecret') since it has select:false
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorSecret:   secret.base32,
      twoFactorVerified: false   // Reset verification status
    });

    // Generate QR code as a data URL (base64 PNG image)
    // The otpauth_url contains all info the authenticator app needs
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success:   true,
      secret:    secret.base32,      // Show this as manual entry option
      qrCode:    qrCodeDataURL,      // Show this as scannable QR image
      otpauthUrl: secret.otpauth_url
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  POST /api/2fa/verify-setup ───────────────────────────────────────
// @desc   Verify the code from authenticator app to complete 2FA setup
// @access Private
const verifySetup = async (req, res) => {
  try {
    const { token } = req.body;
    // token = the 6-digit code from the authenticator app

    if (!token || token.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code'
      });
    }

    // Get user with their 2FA secret
    const user = await User.findById(req.user._id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please initiate 2FA setup first'
      });
    }

    // Verify the token against the secret
    // window: 1 means accept codes from 1 period before/after current
    // This accounts for slight time drift between server and phone
    const isValid = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code. Please check your authenticator app and try again.'
      });
    }

    // Generate backup codes
    const { codes, hashedCodes } = await generateBackupCodes();

    // Enable 2FA on the account
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled:      true,
      twoFactorVerified:     true,
      twoFactorBackupCodes:  hashedCodes
    });

    res.status(200).json({
      success:     true,
      message:     '2FA enabled successfully!',
      backupCodes: codes
      // IMPORTANT: These plain backup codes are shown ONCE
      // After this response, only the hashed versions exist in DB
    });

  } catch (error) {
    console.error('2FA verify setup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  DELETE /api/2fa/disable ──────────────────────────────────────────
// @desc   Disable 2FA on the account
// @access Private
const disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Require password confirmation for security
    const user = await User.findById(req.user._id).select('+password');

    // For local accounts, verify password
    if (user.authProvider === 'local') {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to disable 2FA'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Verify current 2FA code
    const userWith2FA = await User.findById(req.user._id)
      .select('+twoFactorSecret');

    const isCodeValid = speakeasy.totp.verify({
      secret:   userWith2FA.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    // Disable and clear all 2FA data
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled:     false,
      twoFactorVerified:    false,
      twoFactorSecret:      null,
      twoFactorBackupCodes: []
    });

    res.status(200).json({
      success: true,
      message: '2FA has been disabled on your account'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN FLOW
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/2fa/verify-login ───────────────────────────────────────
// @desc   Verify 2FA code during login (step 2 of login flow)
// @access Semi-private (requires temp token from login step 1)
const verifyLogin = async (req, res) => {
  try {
    const { token, tempToken, backupCode } = req.body;
    // token      = 6-digit TOTP code from authenticator app
    // tempToken  = short-lived token from step 1 of login
    // backupCode = emergency backup code (alternative to token)

    // ── Validate temp token ───────────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    // Ensure this token is specifically for 2FA verification
    if (decoded.purpose !== '2fa_verification') {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token'
      });
    }

    const user = await User.findById(decoded.id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled on this account'
      });
    }

    let isValid = false;

    if (backupCode) {
      // ── Backup code verification ──────────────────────────────────────────
      // Check each hashed backup code
      let usedIndex = -1;

      for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
        const matches = await bcrypt.compare(
          backupCode.toUpperCase(),
          user.twoFactorBackupCodes[i]
        );
        if (matches) {
          usedIndex = i;
          isValid   = true;
          break;
        }
      }

      if (isValid && usedIndex !== -1) {
        // Remove the used backup code (each backup code is single-use)
        const updatedCodes = [...user.twoFactorBackupCodes];
        updatedCodes.splice(usedIndex, 1);

        await User.findByIdAndUpdate(decoded.id, {
          twoFactorBackupCodes: updatedCodes
        });
      }

    } else if (token) {
      // ── TOTP code verification ────────────────────────────────────────────
      isValid = speakeasy.totp.verify({
        secret:   user.twoFactorSecret,
        encoding: 'base32',
        token,
        window:   1
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a 2FA code or a backup code'
      });
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: backupCode
          ? 'Invalid backup code. Please check and try again.'
          : 'Invalid code. Check your authenticator app and try again.'
      });
    }

    // ── 2FA passed — issue full JWT ───────────────────────────────────────────
    const fullToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: '2FA verified successfully',
      token:   fullToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses || [],
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('2FA verify login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/2fa/status ───────────────────────────────────────────────
// @desc   Get current 2FA status for the logged-in user
// @access Private
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('twoFactorEnabled twoFactorVerified +twoFactorBackupCodes');

    res.status(200).json({
      success:           true,
      twoFactorEnabled:  user.twoFactorEnabled,
      twoFactorVerified: user.twoFactorVerified,
      backupCodesCount:  user.twoFactorBackupCodes?.length || 0
    });

  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  POST /api/2fa/regenerate-backup-codes ────────────────────────────
// @desc   Generate new backup codes (invalidates old ones)
// @access Private
const regenerateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user._id)
      .select('+twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify 2FA code before regenerating
    const isValid = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    const { codes, hashedCodes } = await generateBackupCodes();

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorBackupCodes: hashedCodes
    });

    res.status(200).json({
      success:     true,
      backupCodes: codes,
      message:     'New backup codes generated. Save these in a safe place!'
    });

  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  setup2FA,
  verifySetup,
  disable2FA,
  verifyLogin,
  get2FAStatus,
  regenerateBackupCodes
};