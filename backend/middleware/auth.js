 // middleware/auth.js — JWT Authentication Guard
//
// This middleware is like a security checkpoint.
// It runs BEFORE protected route handlers.
// If the token is missing or invalid → request is blocked (401)
// If the token is valid → user info is attached to req.user → request continues

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect Middleware ───────────────────────────────────────────────────────
// Use this on any route that requires the user to be logged in
// Example: router.get('/profile', protect, getProfile)

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as:
  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token by splitting "Bearer <token>" and taking index [1]
      token = req.headers.authorization.split(' ')[1];

      // jwt.verify() decodes the token AND checks if it was signed with our secret
      // If tampered with or expired → throws an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to req so route handlers can access it
      // select('-password') means "get user but exclude the password field"
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found, authorization denied'
        });
      }

      next(); // Token is valid, proceed to the route handler

    } catch (error) {
      // Common errors:
      // JsonWebTokenError → token was tampered with
      // TokenExpiredError → token has expired
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// ─── Admin Only Middleware ────────────────────────────────────────────────────
// Use AFTER protect middleware
// Example: router.post('/courses', protect, adminOnly, createCourse)

const adminOnly = (req, res, next) => {
  // At this point, protect middleware has already verified the token
  // and attached req.user — so we just check the role
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, allow through
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }
};

module.exports = { protect, adminOnly };
