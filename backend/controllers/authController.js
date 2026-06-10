// controllers/authController.js
// Contains the business logic for: Register, Login, Get Profile

const crypto = require('crypto');
const {
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../utils/emailService');

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses,
        twoFactorEnabled: user.twoFactorEnabled
      }
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

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ── Check if 2FA is enabled ───────────────────────────────────────────────
    if (user.twoFactorEnabled) {
      // Do not issue full JWT yet.
      // Issue a short-lived temp token used only for 2FA verification.
      const tempToken = jwt.sign(
        {
          id: user._id,
          purpose: '2fa_verification'
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '10m'
        }
      );

      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Please enter your 2FA code to complete login'
      });
    }

    // No 2FA — issue full JWT normally
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses,
        twoFactorEnabled: user.twoFactorEnabled
      }
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error.'
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

    const token = generateToken(req.user._id);

    const userData = encodeURIComponent(JSON.stringify({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
      isApproved: req.user.isApproved,
      enrolledCourses: req.user.enrolledCourses || [],
      twoFactorEnabled: req.user.twoFactorEnabled
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
  getAllStudents,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  googleCallback,
  googleFailure
};