// controllers/authController.js
// Contains the business logic for: Register, Login, Get Profile, OAuth, Profile, 2FA

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const {
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../utils/emailService');

const User = require('../models/User');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Helper: Generate Temporary 2FA Token ─────────────────────────────────────

const generate2FATempToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      purpose: '2fa_verification'
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
};

// ─── Helper: Safe User Response ───────────────────────────────────────────────

const buildSafeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    profilePicture: user.profilePicture,
    authProvider: user.authProvider,
    isApproved: user.isApproved,
    enrolledCourses: user.enrolledCourses || [],
    twoFactorEnabled: user.twoFactorEnabled || false
  };
};

// ─── Helper: 2FA Secret Encryption ────────────────────────────────────────────

const getEncryptionKey = () => {
  const source =
    process.env.TWO_FACTOR_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'fallback_2fa_secret_key';

  return crypto
    .createHash('sha256')
    .update(source)
    .digest();
};

const encryptSecret = (plainText) => {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decryptSecret = (encryptedText) => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// ─── Helper: Backup Codes ─────────────────────────────────────────────────────

const generatePlainBackupCodes = (count = 8) => {
  return Array.from({ length: count }, () => {
    const part1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${part1}-${part2}`;
  });
};

const hashBackupCodes = async (codes) => {
  return Promise.all(
    codes.map((code) => bcrypt.hash(code, 10))
  );
};

const verifyBackupCode = async (enteredCode, hashedCodes) => {
  for (let i = 0; i < hashedCodes.length; i += 1) {
    const isMatch = await bcrypt.compare(enteredCode, hashedCodes[i]);

    if (isMatch) {
      return {
        valid: true,
        usedIndex: i
      };
    }
  }

  return {
    valid: false,
    usedIndex: -1
  };
};

// ─── Helper: Verify 2FA Code Or Backup Code ───────────────────────────────────

const verifyTwoFactorInput = async ({ user, code, backupCode }) => {
  if (!user.twoFactorSecret) {
    return {
      valid: false,
      message: '2FA is not configured for this account'
    };
  }

  if (code) {
    const decryptedSecret = decryptSecret(user.twoFactorSecret);

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      return {
        valid: true,
        usedBackupCode: false
      };
    }
  }

  if (backupCode) {
    const result = await verifyBackupCode(
      backupCode.trim().toUpperCase(),
      user.twoFactorBackupCodes || []
    );

    if (result.valid) {
      user.twoFactorBackupCodes.splice(result.usedIndex, 1);
      await user.save({ validateBeforeSave: false });

      return {
        valid: true,
        usedBackupCode: true
      };
    }
  }

  return {
    valid: false,
    message: 'Invalid 2FA code'
  };
};

// ─── @route   POST /api/auth/register ────────────────────────────────────────
// @desc    Register a new student/instructor account
// @access  Public

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: ['student', 'instructor'].includes(role) ? role : 'student'
    });

    const token = generateToken(user._id);

    sendWelcomeEmail({
      toEmail: user.email,
      userName: user.name
    }).catch(err => console.error('Welcome email error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: buildSafeUser(user)
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);

      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error('Register error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// ─── @route   POST /api/auth/login ───────────────────────────────────────────
// @desc    Login with email and password
// @access  Public

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please continue with Google.'
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.twoFactorEnabled) {
      const tempToken = generate2FATempToken(user._id);

      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Please enter your 2FA code to complete login'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: buildSafeUser(user)
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// ─── @route   GET /api/auth/profile ──────────────────────────────────────────
// @desc    Get the currently logged-in user's profile
// @access  Private

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'title thumbnail instructor category level');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// ─── @route   PUT /api/auth/profile ──────────────────────────────────────────
// @desc    Update user profile
// @access  Private

const updateProfile = async (req, res) => {
  try {
    const { name, bio, removeProfilePicture } = req.body;
    const updates = {};

    if (name?.trim()) {
      updates.name = name.trim();
    }

    if (bio !== undefined) {
      updates.bio = bio;
    }

    // Remove custom uploaded picture and fall back to Google avatar.
    // Important: never overwrite avatar here because avatar stores Google photo URL.
    if (removeProfilePicture === 'true' || removeProfilePicture === true) {
      updates.profilePicture = '';
    }

    // Uploaded profile picture overrides Google avatar only through profilePicture.
    if (req.file) {
      updates.profilePicture = `uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── @route   PUT /api/auth/change-password ──────────────────────────────────
// @desc    Change password
// @access  Private

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google accounts cannot change password here. Use Google account settings.'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── @route   GET /api/auth/stats ────────────────────────────────────────────
// @desc    Get student learning statistics
// @access  Private

const getLearningStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const QuizAttempt = require('../models/QuizAttempt');
    const Certificate = require('../models/Certificate');

    const [attempts, certificates] = await Promise.all([
      QuizAttempt.find({ userId: req.user._id }),
      Certificate.find({ userId: req.user._id })
    ]);

    const passedQuizzes = attempts.filter(a => a.passed).length;

    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses: user.enrolledCourses?.length || 0,
        certificates: certificates.length,
        quizzesTaken: attempts.length,
        quizzesPassed: passedQuizzes,
        avgQuizScore: avgScore,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── @route   GET /api/auth/students ─────────────────────────────────────────
// @desc    Get all registered students
// @access  Private/Admin

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error('Get students error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error fetching students'
    });
  }
};

// ─── @route   POST /api/auth/forgot-password ─────────────────────────────────
// @desc    Generate reset token and send email
// @access  Public

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        userName: user.name,
        resetURL
      });

      res.status(200).json(genericResponse);

    } catch (emailError) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save({ validateBeforeSave: false });

      console.error('Reset email send error:', emailError.message);

      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ─── @route   GET /api/auth/verify-reset-token/:token ────────────────────────
// @desc    Check if token is valid before showing reset form
// @access  Public

const verifyResetToken = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: user.email
    });

  } catch (error) {
    console.error('Verify reset token error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ─── @route   POST /api/auth/reset-password/:token ───────────────────────────
// @desc    Set the new password
// @access  Public

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.'
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful!',
      token: jwtToken,
      user: buildSafeUser(user)
    });

  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ─── @route   GET /api/auth/2fa/status ───────────────────────────────────────
// @desc    Get 2FA status
// @access  Private

const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerified: user.twoFactorVerified
    });

  } catch (error) {
    console.error('Get 2FA status error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── @route   POST /api/auth/2fa/setup ───────────────────────────────────────
// @desc    Generate 2FA secret and QR code
// @access  Private

const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `ELearnify (${user.email})`,
      issuer: 'ELearnify',
      length: 32
    });

    user.twoFactorSecret = encryptSecret(secret.base32);
    user.twoFactorEnabled = false;
    user.twoFactorVerified = false;
    user.twoFactorBackupCodes = [];

    await user.save({ validateBeforeSave: false });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'Scan the QR code with your authenticator app',
      qrCode,
      manualEntryKey: secret.base32
    });

  } catch (error) {
    console.error('Setup 2FA error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error setting up 2FA'
    });
  }
};

// ─── @route   POST /api/auth/2fa/verify-setup ────────────────────────────────
// @desc    Verify setup code and enable 2FA
// @access  Private

const verify2FASetup = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 6-digit code'
      });
    }

    const user = await User.findById(req.user._id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please start 2FA setup first'
      });
    }

    const decryptedSecret = decryptSecret(user.twoFactorSecret);

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code. Please try again.'
      });
    }

    const backupCodes = generatePlainBackupCodes(8);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    user.twoFactorEnabled = true;
    user.twoFactorVerified = true;
    user.twoFactorBackupCodes = hashedBackupCodes;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes
    });

  } catch (error) {
    console.error('Verify 2FA setup error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error verifying 2FA setup'
    });
  }
};

// ─── @route   POST /api/auth/2fa/verify-login ────────────────────────────────
// @desc    Verify 2FA login code and issue JWT
// @access  Public with tempToken

const verify2FALogin = async (req, res) => {
  try {
    const { tempToken, code, backupCode } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary login token is required'
      });
    }

    if (!code && !backupCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a 2FA code or backup code'
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '2FA session expired. Please log in again.'
      });
    }

    if (decoded.purpose !== '2fa_verification') {
      return res.status(401).json({
        success: false,
        message: 'Invalid temporary token'
      });
    }

    const user = await User.findById(decoded.id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    const verification = await verifyTwoFactorInput({
      user,
      code,
      backupCode
    });

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Invalid 2FA code'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: verification.usedBackupCode
        ? 'Login successful. Backup code used.'
        : 'Login successful',
      token,
      user: buildSafeUser(user)
    });

  } catch (error) {
    console.error('Verify 2FA login error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error verifying 2FA login'
    });
  }
};

// ─── @route   POST /api/auth/2fa/disable ─────────────────────────────────────
// @desc    Disable 2FA
// @access  Private

const disable2FA = async (req, res) => {
  try {
    const { code, backupCode, password } = req.body;

    const user = await User.findById(req.user._id)
      .select('+password +twoFactorSecret +twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    if (user.password && password) {
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Password is incorrect'
        });
      }
    } else {
      const verification = await verifyTwoFactorInput({
        user,
        code,
        backupCode
      });

      if (!verification.valid) {
        return res.status(400).json({
          success: false,
          message: verification.message || 'Invalid 2FA code'
        });
      }
    }

    user.twoFactorSecret = null;
    user.twoFactorEnabled = false;
    user.twoFactorVerified = false;
    user.twoFactorBackupCodes = [];

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error disabling 2FA'
    });
  }
};

// ─── @route   POST /api/auth/2fa/backup-codes/regenerate ─────────────────────
// @desc    Regenerate backup codes
// @access  Private

const regenerateBackupCodes = async (req, res) => {
  try {
    const { code, backupCode } = req.body;

    if (!code && !backupCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a 2FA code or backup code'
      });
    }

    const user = await User.findById(req.user._id)
      .select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    const verification = await verifyTwoFactorInput({
      user,
      code,
      backupCode
    });

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Invalid 2FA code'
      });
    }

    const backupCodes = generatePlainBackupCodes(8);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'New backup codes generated',
      backupCodes
    });

  } catch (error) {
    console.error('Regenerate backup codes error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error regenerating backup codes'
    });
  }
};

// ─── @route   GET /api/auth/google/callback ──────────────────────────────────
// @desc    Handle Google OAuth callback
// @access  Public

const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed`
      );
    }

    if (req.user.twoFactorEnabled) {
      const tempToken = generate2FATempToken(req.user._id);

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?requires2FA=true&tempToken=${encodeURIComponent(tempToken)}`
      );
    }

    const token = generateToken(req.user._id);

    const userData = encodeURIComponent(JSON.stringify({
      ...buildSafeUser(req.user),
      authProvider: req.user.authProvider
    }));

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`
    );

  } catch (error) {
    console.error('Google callback error:', error);

    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=server_error`
    );
  }
};

// ─── @route   GET /api/auth/google/failure ───────────────────────────────────
// @desc    Handle OAuth failure
// @access  Public

const googleFailure = (req, res) => {
  res.redirect(
    `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  );
};

module.exports = {
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
};