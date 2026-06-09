// routes/instructorRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getInstructorDashboard,
  getInstructorStudents,
  updateInstructorProfile,
  getAllInstructors,
  toggleInstructorApproval,
  changeUserRole
} = require('../controllers/instructorController');

const { getInstructorCourses } = require('../controllers/courseController');

const {
  protect,
  adminOnly,
  instructorOrAdmin
} = require('../middleware/auth');

// ── Instructor routes ─────────────────────────────────────────────────────────
router.get ('/dashboard',   protect, instructorOrAdmin, getInstructorDashboard);
router.get ('/my-courses',  protect, instructorOrAdmin, getInstructorCourses);
router.get ('/students',    protect, instructorOrAdmin, getInstructorStudents);
router.put ('/profile',     protect, instructorOrAdmin, updateInstructorProfile);

// ── Admin-only instructor management ─────────────────────────────────────────
router.get ('/',             protect, adminOnly, getAllInstructors);
router.put ('/:id/approve',  protect, adminOnly, toggleInstructorApproval);
router.put ('/:id/role',     protect, adminOnly, changeUserRole);

module.exports = router;