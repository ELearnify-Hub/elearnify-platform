 // controllers/authController.js
// Contains the business logic for: Register, Login, Get Profile
const crypto = require('crypto');  // Built into Node.js — no install needed
const {
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../utils/emailService');

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
// We extract this into a helper so we don't repeat it in register and login

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload: data encoded inside the token
    process.env.JWT_SECRET,      // Secret key used to sign the token
    { expiresIn: '7d' }          // Token expires in 7 days
  );
};

// ─── @route   POST /api/auth/register ────────────────────────────────────────
// @desc    Register a new student account
// @access  Public (no token required)

const register = async (req, res) => {
  try {
    // Step 1: Extract data from request body
    const { name, email, password, role } = req.body;

    // Step 2: Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Step 3: Check if user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Step 4: Create the user
    // Plain password is passed here.
    // User.js pre-save middleware will hash it automatically.
    const user = await User.create({
      name,
      email,
      password,

      // Students and instructors can self-register.
      // Admin accounts can never be self-registered from the API.
      role: ['student', 'instructor'].includes(role) ? role : 'student'
    });

    // Step 5: Generate JWT token for immediate login after registration
    const token = generateToken(user._id);

    // Send welcome email without blocking the response
    sendWelcomeEmail({
      toEmail: user.email,
      userName: user.name
    }).catch(err => console.error('Welcome email error:', err.message));

    // Step 6: Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses
      }
    });

  } catch (error) {
    // Handle Mongoose validation errors nicely
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
    // Step 1: Extract credentials
    const { email, password } = req.body;

    // Step 2: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Step 3: Find user by email
    // We use .select('+password') because password has select:false in the schema
    // This explicitly requests it for this one query
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // IMPORTANT: Use vague error messages for security
      // Don't say "Email not found" — that lets hackers know which emails exist
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Step 4: Compare the entered password with the stored hash
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Step 5: Generate token and send response
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
        isApproved: user.isApproved,
        enrolledCourses: user.enrolledCourses
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
// @access  Private (requires valid JWT token)

const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    // We populate enrolledCourses to get full course data, not just IDs
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
// @desc    Get all registered students (Admin only)
// @access  Private/Admin

const getAllStudents = async (req, res) => {
  try {
    // Find all users with role 'student'
    // Sort by newest first (-1 = descending)
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

// ─── @route   POST /api/auth/forgot-password ──────────────────────────────────
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

    // Find user — but ALWAYS return same response whether found or not
    // This prevents "email enumeration attacks"
    // (attacker trying to find which emails are registered)
    const user = await User.findOne({ email: email.toLowerCase() });

    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.'
    };

    if (!user) {
      // Don't reveal that email doesn't exist
      return res.status(200).json(genericResponse);
    }

    // ── Generate secure random token ──────────────────────────────────────────
    // crypto.randomBytes(32) = 32 random bytes = 256 bits of entropy
    // Practically impossible to guess or brute force
    const resetToken = crypto.randomBytes(32).toString('hex');

    // ── Hash before saving to database ────────────────────────────────────────
    // If DB is ever breached, attacker gets only hashes — useless without plain token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // ── Save to user document ─────────────────────────────────────────────────
    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save({ validateBeforeSave: false });
    // validateBeforeSave: false = skip field validation
    // (we're only updating reset fields, not changing name/email/password)

    // ── Build reset URL ───────────────────────────────────────────────────────
    // Plain token goes in URL — NOT the hashed version
    // User clicks → we hash the URL token → compare with DB hash
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ── Send email ────────────────────────────────────────────────────────────
    try {
      await sendPasswordResetEmail({
        toEmail:  user.email,
        userName: user.name,
        resetURL
      });
      res.status(200).json(genericResponse);

    } catch (emailError) {
      // Email failed — clean up the saved token so it can't be exploited
      user.passwordResetToken   = null;
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
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   GET /api/auth/verify-reset-token/:token ────────────────────────
// @desc    Check if token is valid BEFORE showing the reset form
// @access  Public

const verifyResetToken = async (req, res) => {
  try {
    // Hash the token from URL and look it up in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() }
      // $gt: Date.now() → "expiry time is in the future" = not expired
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
      email:   user.email  // We show this on the reset page so user knows which account
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   POST /api/auth/reset-password/:token ───────────────────────────
// @desc    Set the new password
// @access  Public

const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // ── Find user by hashed token that hasn't expired ─────────────────────────
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.'
      });
    }

    // ── Update password ───────────────────────────────────────────────────────
    // The pre-save hook in User.js auto-hashes this
    user.password             = password;
    user.passwordResetToken   = null;  // Delete token — one-time use
    user.passwordResetExpires = null;
    await user.save();

    // ── Auto-login after reset ────────────────────────────────────────────────
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful!',
      token:   jwtToken,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllStudents,
  forgotPassword,     // ← ADD
  verifyResetToken,   // ← ADD
  resetPassword       // ← ADD
};
