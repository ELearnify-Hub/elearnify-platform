// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();

const {
  enrollInCourse,
  getMyEnrolledCourses,
  unenrollCourse
} = require('../controllers/enrollmentController');

const { protect } = require('../middleware/auth');

// All enrollment routes require login
router.get('/my-courses', protect, getMyEnrolledCourses);
router.post('/:courseId', protect, enrollInCourse);
router.delete('/:courseId', protect, unenrollCourse);

module.exports = router;
