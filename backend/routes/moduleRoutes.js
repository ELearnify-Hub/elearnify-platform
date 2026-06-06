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

const { protect, adminOnly } = require('../middleware/auth');
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
  adminOnly,
  addModule
);

router.put(
  '/:moduleId',
  protect,
  adminOnly,
  updateModule
);

router.delete(
  '/:moduleId',
  protect,
  adminOnly,
  deleteModule
);

// ── Lesson Routes ────────────────────────────────────────────────────────────

router.post(
  '/:moduleId/lessons',
  protect,
  adminOnly,
  uploadLesson.single('file'),
  addLesson
);

router.put(
  '/:moduleId/lessons/:lessonId',
  protect,
  adminOnly,
  uploadLesson.single('file'),
  updateLesson
);

router.delete(
  '/:moduleId/lessons/:lessonId',
  protect,
  adminOnly,
  deleteLesson
);

// ── Progress Routes ──────────────────────────────────────────────────────────

router.post(
  '/progress',
  protect,
  markLessonComplete
);

module.exports = router;