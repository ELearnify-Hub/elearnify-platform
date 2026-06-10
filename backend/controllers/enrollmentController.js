// controllers/enrollmentController.js
const Course = require('../models/Course');
const User = require('../models/User');

// ─── @route   POST /api/enrollments/:courseId ────────────────────────────────
// @desc    Enroll current user in a course
// @access  Private
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for enrollment'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadyEnrolled = user.enrolledCourses.some(
      (id) => id.toString() === courseId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId }
    });

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId }
    });

    res.status(200).json({
      success: true,
      message: `Successfully enrolled in "${course.title}"`
    });

  } catch (error) {
    console.error('Enroll error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during enrollment'
    });
  }
};

// ─── @route   GET /api/enrollments/my-courses ────────────────────────────────
// @desc    Get all courses the logged-in user is enrolled in
// @access  Private
const getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses',
        select: '_id title description thumbnail instructor category level duration price isPublished enrolledStudents'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      courses: user.enrolledCourses
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error fetching enrolled courses'
    });
  }
};

// ─── @route   DELETE /api/enrollments/:courseId ──────────────────────────────
// @desc    Unenroll current user from a course
// @access  Private
const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Course creators should manage their own course, not unenroll from it.
    if (
      course.createdBy &&
      course.createdBy.toString() === userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unenroll from a course you created.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isEnrolled = user.enrolledCourses.some(
      (id) => id.toString() === courseId.toString()
    );

    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId }
    });

    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Unenrolled from course successfully'
    });

  } catch (error) {
    console.error('Unenroll error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during unenrollment'
    });
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrolledCourses,
  unenrollCourse,
  // Backward-compatible alias in case older code imports this name
  unenrollFromCourse: unenrollCourse
};
