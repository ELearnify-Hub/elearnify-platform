 // controllers/courseController.js
// Business logic for all course operations

const Course = require('../models/Course');
const Review = require('../models/Review');
const path = require('path');
const fs = require('fs');

// ── Helper: attach review stats to course objects ────────────────────────────
const attachReviewStats = async (courses) => {
  const list = Array.isArray(courses) ? courses : [courses];
  const ids = list.map((course) => course._id);

  const stats = await Review.aggregate([
    { $match: { courseId: { $in: ids }, isApproved: true } },
    {
      $group: {
        _id: '$courseId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const statsMap = new Map(
    stats.map((item) => [
      item._id.toString(),
      {
        avgRating: Number(item.avgRating.toFixed(1)),
        reviewCount: item.reviewCount
      }
    ])
  );

  const withStats = list.map((course) => {
    const obj = typeof course.toObject === 'function' ? course.toObject() : course;
    const courseStats = statsMap.get(obj._id.toString()) || {
      avgRating: 0,
      reviewCount: 0
    };

    return {
      ...obj,
      ...courseStats
    };
  });

  return Array.isArray(courses) ? withStats : withStats[0];
};

// ─── @route   GET /api/courses ────────────────────────────────────────────────
// @desc    Get all published courses (with search and filter)
// @access  Public

const getAllCourses = async (req, res) => {
  try {
    const {
      search, category, level,
      minPrice, maxPrice, sortBy,
      page = 1, limit = 12
    } = req.query;

    let filter = req.user?.role === 'admin' ? {} : { isPublished: true };

    // Text search
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor:  { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') filter.category = category;
    if (level    && level    !== 'All') filter.level    = level;

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortOptions = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      popular:  { 'enrolledStudents': -1 },
      'price-low':  { price:  1 },
      'price-high': { price: -1 }
    };
    const sort = sortOptions[sortBy] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .select('-modules')
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count:      courses.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      courses
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route   GET /api/courses/:id ───────────────────────────────────────────
// @desc    Get single course by ID
// @access  Public

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseWithReviewStats = await attachReviewStats(course);

    res.status(200).json({
      success: true,
      course: courseWithReviewStats
    });

  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course'
    });
  }
};

// ─── @route   POST /api/courses ───────────────────────────────────────────────
// @desc    Create a new course (Admin only)
// @access  Private/Admin

const createCourse = async (req, res) => {
  try {
    const {
      title, description, instructor,
      category, level, price, duration
    } = req.body;

    const thumbnail = req.file
      ? `uploads/${req.file.filename}`
      : '';

    // If the creator is an instructor, use their name automatically
    const instructorName = req.user.role === 'instructor'
      ? req.user.name
      : (instructor || req.user.name);

    const course = await Course.create({
      title,
      description,
      instructor:  instructorName,
      category,
      level,
      price:       price     || 0,
      duration:    duration  || '',
      thumbnail,
      createdBy:   req.user._id,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Helper: verify ownership ──────────────────────────────────────────────────
// Admins can edit any course
// Instructors can only edit their own
const verifyOwnership = (course, user) => {
  if (user.role === 'admin') return true;
  return course.createdBy.toString() === user._id.toString();
};

// ─── @route   PUT /api/courses/:id ───────────────────────────────────────────
// @desc    Update a course (Admin only)
// @access  Private/Admin

const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // ── Ownership check ───────────────────────────────────────────────────────
    if (!verifyOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own courses'
      });
    }

    if (req.file) {
      if (course.thumbnail) {
        const oldPath = path.join(__dirname, '..', course.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.thumbnail = `uploads/${req.file.filename}`;
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route   DELETE /api/courses/:id ────────────────────────────────────────
// @desc    Delete a course (Admin only)
// @access  Private/Admin

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!verifyOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses'
      });
    }

    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    };

    deleteFile(course.thumbnail);
    course.videos.forEach(v => deleteFile(v.filePath));
    course.pdfs.forEach(p => deleteFile(p.filePath));

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Course deleted successfully' });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/courses/my-courses ───────────────────────────────────────
// @desc   Get courses created by the logged-in instructor
// @access Instructor / Admin
const getInstructorCourses = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}                                    // Admin sees all
      : { createdBy: req.user._id };          // Instructor sees only theirs

    const courses = await Course.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Attach total enrollment counts
    const coursesWithStats = courses.map(c => ({
      ...c.toObject(),
      totalEnrollments: c.enrolledStudents?.length || 0,
      totalLessons:     c.modules?.reduce(
        (sum, m) => sum + (m.lessons?.length || 0), 0
      ) || 0
    }));

    res.status(200).json({
      success: true,
      count:   courses.length,
      courses: coursesWithStats
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route   POST /api/courses/:id/upload-video ─────────────────────────────
// @desc    Upload a video to a course (Admin only)
// @access  Private/Admin

const uploadVideo = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!verifyOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload content to your own courses'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, duration } = req.body;

    // Push new video to the course's videos array
    course.videos.push({
      title: title || `Lesson ${course.videos.length + 1}`,
      filePath: `uploads/${req.file.filename}`,
      duration: duration || ''
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      videos: course.videos
    });

  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading video'
    });
  }
};

// ─── @route   POST /api/courses/:id/upload-pdf ───────────────────────────────
// @desc    Upload a PDF to a course (Admin only)
// @access  Private/Admin

const uploadPDF = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!verifyOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload content to your own courses'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const { title } = req.body;

    course.pdfs.push({
      title: title || `Material ${course.pdfs.length + 1}`,
      filePath: `uploads/${req.file.filename}`
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      pdfs: course.pdfs
    });

  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading PDF'
    });
  }
};

// ─── @route   PUT /api/courses/:id/publish ───────────────────────────────────
// @desc    Toggle course published status
// @access  Private/Admin

const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!verifyOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own courses'
      });
    }

    if (req.user.role === 'instructor' && !req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account must be approved before publishing courses'
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: course.isPublished
    });

  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadVideo,
  uploadPDF,
  togglePublish,
  getInstructorCourses
};