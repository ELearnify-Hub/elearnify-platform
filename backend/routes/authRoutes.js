 // routes/authRoutes.js
// Defines URL endpoints and connects them to controller functions
// Think of this as a menu — it lists what's available and who serves it

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  register,
  login,
  getProfile,
  getAllStudents
} = require('../controllers/authController');

// Import middleware
const { protect, adminOnly } = require('../middleware/auth');

// ─── Public Routes ────────────────────────────────────────────────────────────
// No token needed for these

// POST /api/auth/register → Register new account
router.post('/register', register);

// POST /api/auth/login → Login
router.post('/login', login);

// ─── Protected Routes ─────────────────────────────────────────────────────────
// 'protect' middleware runs first — verifies JWT token
// If valid, continues to the controller
// If invalid, returns 401 Unauthorized

// GET /api/auth/profile → Get logged-in user profile
router.get('/profile', protect, getProfile);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
// Both 'protect' AND 'adminOnly' must pass

// GET /api/auth/students → Get all students
router.get('/students', protect, adminOnly, getAllStudents);

module.exports = router;
