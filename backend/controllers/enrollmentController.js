 // controllers/enrollmentController.js

const User = require('../models/User');
const Course = require('../models/Course');

// ─── @route   POST /api/enrollments/:courseId ─────────────────────────────────
// @desc    Enroll the logged-in student in a course
// @access  Private (students only)

const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Check course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for enrollment'
      });
    }

    // Check if already enrolled - convert to string for comparison
    const user = await User.findById(userId);
    const alreadyEnrolled = user.enrolledCourses.some(id => 
      id.toString() === courseId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Add course to user's enrolledCourses array
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId } // $addToSet prevents duplicates
    }, { new: true });

    // Add user to course's enrolledStudents array
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId }
    });

    console.log(`User ${userId} enrolled in course ${courseId}`);
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

    console.log(`Fetched ${user.enrolledCourses.length} courses for user ${req.user._id}`);
    console.log('Enrolled courses:', user.enrolledCourses);

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

// ─── @route   DELETE /api/enrollments/:courseId ───────────────────────────────
// @desc    Unenroll from a course
// @access  Private

const unenrollFromCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId }   // $pull removes the item from array
    });

    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
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
  unenrollFromCourse
};
