// routes/moduleRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true → allows access to params from parent router
// e.g. :courseId from /api/courses/:courseId/modules

const {
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  getCourseModules,
  markLessonComplete
} = require('../controllers/moduleController');

const { protect, instructorOrAdmin } = require('../middleware/auth');
const { uploadLesson } = require('../middleware/upload');

// ── Module Routes ─────────────────────────────────────────────────────────────

router.get(
  '/',
  protect,
  getCourseModules
);

router.post(
  '/',
  protect,
  instructorOrAdmin,
  addModule
);

router.put(
  '/:moduleId',
  protect,
  instructorOrAdmin,
  updateModule
);

router.delete(
  '/:moduleId',
  protect,
  instructorOrAdmin,
  deleteModule
);

// ── Lesson Routes ────────────────────────────────────────────────────────────

router.post(
  '/:moduleId/lessons',
  protect,
  instructorOrAdmin,
  uploadLesson.single('file'),
  addLesson
);

router.put(
  '/:moduleId/lessons/:lessonId',
  protect,
  instructorOrAdmin,
  uploadLesson.single('file'),
  updateLesson
);

router.delete(
  '/:moduleId/lessons/:lessonId',
  protect,
  instructorOrAdmin,
  deleteLesson
);

// ── Progress Routes ──────────────────────────────────────────────────────────

router.post(
  '/progress',
  protect,
  markLessonComplete
);

module.exports = router;