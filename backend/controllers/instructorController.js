// controllers/instructorController.js
// Instructor-specific analytics and profile management

const User        = require('../models/User');
const Course      = require('../models/Course');
const QuizAttempt = require('../models/QuizAttempt');

// ── @route  GET /api/instructor/dashboard ─────────────────────────────────────
// @desc   Get instructor's dashboard stats
// @access Instructor
const getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Get all courses by this instructor
    const courses = await Course.find({ createdBy: instructorId });

    // Total unique students across all courses
    const allStudentIds = new Set();
    courses.forEach(course => {
      course.enrolledStudents?.forEach(id => allStudentIds.add(id.toString()));
    });

    // Total lessons across all courses
    const totalLessons = courses.reduce((sum, c) =>
      sum + c.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0), 0
    );

    // Published vs draft
    const publishedCount = courses.filter(c => c.isPublished).length;
    const draftCount     = courses.length - publishedCount;

    // Total quiz attempts on instructor's courses
    const courseIds      = courses.map(c => c._id);
    const totalAttempts  = await QuizAttempt.countDocuments({
      courseId: { $in: courseIds }
    });

    // Per-course breakdown
    const courseStats = courses.map(course => ({
      _id:          course._id,
      title:        course.title,
      category:     course.category,
      level:        course.level,
      thumbnail:    course.thumbnail,
      isPublished:  course.isPublished,
      price:        course.price,
      enrollments:  course.enrolledStudents?.length || 0,
      modules:      course.modules?.length || 0,
      lessons:      course.modules?.reduce(
        (s, m) => s + (m.lessons?.length || 0), 0
      ) || 0,
      createdAt:    course.createdAt
    }));

    // Monthly enrollment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    res.status(200).json({
      success: true,
      stats: {
        totalCourses:   courses.length,
        publishedCount,
        draftCount,
        totalStudents:  allStudentIds.size,
        totalLessons,
        totalAttempts
      },
      courseStats,
      instructor: {
        name:    req.user.name,
        email:   req.user.email,
        profile: req.user.instructorProfile
      }
    });

  } catch (error) {
    console.error('Instructor dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/instructor/students ──────────────────────────────────────
// @desc   Get all students enrolled in instructor's courses
// @access Instructor
const getInstructorStudents = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id })
      .populate('enrolledStudents', 'name email createdAt');

    // Build unique student list with which courses they're in
    const studentMap = new Map();

    courses.forEach(course => {
      course.enrolledStudents?.forEach(student => {
        const id = student._id.toString();
        if (!studentMap.has(id)) {
          studentMap.set(id, {
            _id:          student._id,
            name:         student.name,
            email:        student.email,
            joinedAt:     student.createdAt,
            enrolledIn:   []
          });
        }
        studentMap.get(id).enrolledIn.push({
          courseId:   course._id,
          courseTitle: course.title
        });
      });
    });

    const students = Array.from(studentMap.values());

    res.status(200).json({
      success: true,
      count:   students.length,
      students
    });

  } catch (error) {
    console.error('Get instructor students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/instructor/profile ───────────────────────────────────────
// @desc   Update instructor profile (bio, expertise, website)
// @access Instructor
const updateInstructorProfile = async (req, res) => {
  try {
    const { bio, expertise, website } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'instructorProfile.bio':       bio       || '',
          'instructorProfile.expertise': expertise || [],
          'instructorProfile.website':   website   || ''
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/instructor/all ───────────────────────────────────────────
// @desc   Get all instructors (Admin only)
// @access Admin
const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Add course count per instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (inst) => {
        const courseCount = await Course.countDocuments({
          createdBy: inst._id
        });
        return { ...inst.toObject(), courseCount };
      })
    );

    res.status(200).json({
      success: true,
      count:   instructors.length,
      instructors: instructorsWithStats
    });

  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/instructor/:id/approve ───────────────────────────────────
// @desc   Approve or revoke an instructor account (Admin)
// @access Admin
const toggleInstructorApproval = async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id:  req.params.id,
      role: 'instructor'
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    instructor.isApproved = !instructor.isApproved;

    await instructor.save();

    res.status(200).json({
      success: true,
      isApproved: instructor.isApproved,
      message: `Instructor ${instructor.isApproved
        ? 'approved'
        : 'approval revoked'
      } successfully`
    });

  } catch (error) {
    console.error('Toggle approval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/instructor/:id/role ──────────────────────────────────────
// @desc   Promote student to instructor or demote (Admin)
// @access Admin
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, instructor, or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          role,
          ...(role === 'instructor' && {
            isApproved: true
          }),
          ...(role !== 'instructor' && {
            isApproved: false
          })
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });

  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getInstructorDashboard,
  getInstructorStudents,
  updateInstructorProfile,
  getAllInstructors,
  toggleInstructorApproval,
  changeUserRole
};