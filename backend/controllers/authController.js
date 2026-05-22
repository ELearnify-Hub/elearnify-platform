 // controllers/authController.js
// Contains the business logic for: Register, Login, Get Profile

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
    // NOTE: We pass the plain password here
    // The pre-save middleware in User.js will hash it automatically
    const user = await User.create({
      name,
      email,
      password,
      // Prevent someone from registering as admin via the API
      // Admin accounts should be created manually or via a separate secure process
      role: role === 'admin' ? 'student' : (role || 'student')
    });

    // Step 5: Generate JWT token for immediate login after registration
    const token = generateToken(user._id);

    // Step 6: Send response
    // We manually build the response to avoid sending sensitive fields
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

module.exports = {
  register,
  login,
  getProfile,
  getAllStudents
};
