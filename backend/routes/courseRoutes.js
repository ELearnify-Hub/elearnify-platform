 // routes/courseRoutes.js

const express = require('express');
const router = express.Router();

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadVideo,
  uploadPDF,
  togglePublish
} = require('../controllers/courseController');

const { protect, adminOnly } = require('../middleware/auth');
const { uploadThumbnail, uploadVideo: multerVideo, uploadPDF: multerPDF } = require('../middleware/upload');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// uploadThumbnail.single('thumbnail') — Multer processes ONE file from the
// form field named 'thumbnail', THEN createCourse controller runs

router.post('/',
  protect,
  adminOnly,
  uploadThumbnail.single('thumbnail'),
  createCourse
);

router.put('/:id',
  protect,
  adminOnly,
  uploadThumbnail.single('thumbnail'),
  updateCourse
);

router.delete('/:id',
  protect,
  adminOnly,
  deleteCourse
);

router.post('/:id/upload-video',
  protect,
  adminOnly,
  multerVideo.single('video'),
  uploadVideo
);

router.post('/:id/upload-pdf',
  protect,
  adminOnly,
  multerPDF.single('pdf'),
  uploadPDF
);

router.put('/:id/publish',
  protect,
  adminOnly,
  togglePublish
);

module.exports = router;
