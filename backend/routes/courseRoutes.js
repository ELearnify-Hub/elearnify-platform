const express = require('express');
const router  = express.Router();

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

const {
  protect,
  adminOnly,
  instructorOrAdmin
} = require('../middleware/auth');

const {
  uploadThumbnail,
  uploadVideo: multerVideo,
  uploadPDF:   multerPDF
} = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const jwt  = require('jsonwebtoken');
    const User = require('../models/User');
    try {
      const token   = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).select('-password').then(user => {
        req.user = user;
        next();
      });
    } catch { next(); }
  } else { next(); }
};

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/',    optionalAuth, getAllCourses);
router.get('/:id', getCourseById);

// ── Instructor OR Admin ───────────────────────────────────────────────────────
router.post('/',
  protect, instructorOrAdmin,
  uploadThumbnail.single('thumbnail'),
  createCourse
);

router.put('/:id',
  protect, instructorOrAdmin,
  uploadThumbnail.single('thumbnail'),
  updateCourse
);

router.delete('/:id',
  protect, instructorOrAdmin,
  deleteCourse
);

router.post('/:id/upload-video',
  protect, instructorOrAdmin,
  multerVideo.single('video'),
  uploadVideo
);

router.post('/:id/upload-pdf',
  protect, instructorOrAdmin,
  multerPDF.single('pdf'),
  uploadPDF
);

router.put('/:id/publish',
  protect, instructorOrAdmin,
  togglePublish
);

module.exports = router;