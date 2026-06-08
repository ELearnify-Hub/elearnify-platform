// controllers/moduleController.js
// Handles all CRUD operations for Modules and Lessons within a Course

const Course = require('../models/Course');
const path   = require('path');
const fs     = require('fs');
const CourseProgress = require('../models/CourseProgress');
const { checkAndIssueCertificate } = require('./certificateController');

// ── Helper: delete a file from uploads/ ──────────────────────────────────────
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑 Deleted file: ${filePath}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODULE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/courses/:courseId/modules ───────────────────────────────
// @desc   Add a new module to a course
// @access Private/Admin
const addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Module title is required' });
    }

    // Add new module — order = current length (0-based indexing)
    course.modules.push({
      title,
      description: description || '',
      order:       course.modules.length,
      lessons:     []
    });

    await course.save();

    const newModule = course.modules[course.modules.length - 1];
    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      module:  newModule
    });

  } catch (error) {
    console.error('Add module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/courses/:courseId/modules/:moduleId ─────────────────────
// @desc   Update a module's title/description
// @access Private/Admin
const updateModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // .id() is a Mongoose subdocument helper — finds by _id in array
    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const { title, description } = req.body;
    if (title)       module.title       = title;
    if (description !== undefined) module.description = description;

    await course.save();
    res.status(200).json({
      success: true,
      message: 'Module updated',
      module
    });

  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  DELETE /api/courses/:courseId/modules/:moduleId ──────────────────
// @desc   Delete a module and all its lessons' files
// @access Private/Admin
const deleteModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Delete all lesson files in this module
    module.lessons.forEach(lesson => {
      if (lesson.filePath) deleteFile(lesson.filePath);
    });

    // Remove the module from the array
    module.deleteOne();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module and all its lessons deleted'
    });

  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LESSON OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/courses/:courseId/modules/:moduleId/lessons ─────────────
// @desc   Add a lesson to a module (with optional file upload)
// @access Private/Admin
const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const { title, type, duration, content, isFreePreview } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }

    // If a file was uploaded, req.file is set by Multer
    const filePath = req.file ? `uploads/${req.file.filename}` : '';

    const newLesson = {
      title,
      type:          type          || 'video',
      filePath,
      duration:      duration      || '',
      content:       content       || '',
      isFreePreview: isFreePreview === 'true' || isFreePreview === true,
      order:         module.lessons.length
    };

    module.lessons.push(newLesson);
    await course.save();

    const addedLesson = module.lessons[module.lessons.length - 1];
    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      lesson:  addedLesson
    });

  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId ────
// @desc   Update a lesson's details or replace its file
// @access Private/Admin
const updateLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { title, type, duration, content, isFreePreview } = req.body;

    // Update fields if provided
    if (title)                    lesson.title        = title;
    if (type)                     lesson.type         = type;
    if (duration !== undefined)   lesson.duration     = duration;
    if (content  !== undefined)   lesson.content      = content;
    if (isFreePreview !== undefined) {
      lesson.isFreePreview = isFreePreview === 'true' || isFreePreview === true;
    }

    // If new file uploaded, delete old one and update path
    if (req.file) {
      if (lesson.filePath) deleteFile(lesson.filePath);
      lesson.filePath = `uploads/${req.file.filename}`;
    }

    await course.save();
    res.status(200).json({
      success: true,
      message: 'Lesson updated',
      lesson
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId ─
// @desc   Delete a lesson and its file
// @access Private/Admin
const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Delete the file from disk
    if (lesson.filePath) deleteFile(lesson.filePath);

    // Remove the lesson
    lesson.deleteOne();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/courses/:courseId/modules ────────────────────────────────
// @desc   Get all modules for a course (enrolled students or admin)
// @access Private
const getCourseModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      modules: course.modules.sort((a, b) => a.order - b.order),
      totalLessons: course.totalLessons
    });

  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PROGRESS TRACKING
// ─────────────────────────────────────────────────────────────────────────────

// ── @route  POST /api/courses/:courseId/progress ──────────────────────────────
// @desc   Mark a lesson as complete for the current student
// @access Private (students)
const markLessonComplete = async (req, res) => {
  try {
    const { lessonId, moduleId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isEnrolled = course.enrolledStudents
      .map(id => id.toString())
      .includes(userId.toString());

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    let progress = await CourseProgress.findOne({
      userId,
      courseId: req.params.courseId
    });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId: req.params.courseId,
        completedLessons: []
      });
    }

    const alreadyCompleted = progress.completedLessons.some(item =>
      item.lessonId.toString() === lessonId &&
      item.moduleId.toString() === moduleId
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        lessonId,
        moduleId,
        completedAt: new Date()
      });

      await progress.save();
    }

    const certificate = await checkAndIssueCertificate(
      userId,
      req.params.courseId,
      req.user.name
    );

    res.status(200).json({
      success: true,
      lessonId,
      moduleId,
      certificate,
      message: certificate
        ? 'Lesson completed and certificate issued!'
        : 'Lesson marked as complete'
    });

  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseModules,
  markLessonComplete
};