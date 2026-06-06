// middleware/upload.js
const multer = require('multer');
const path   = require('path');

// ── Shared storage config ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

// ── File filter ───────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Images only'), false);
};

const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Videos only'), false);
};

const pdfFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDFs only'), false);
};

const lessonFilter = (req, file, cb) => {
  const allowed = [
    'video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime',
    'application/pdf'
  ];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Video or PDF only'), false);
};

// ── Multer instances ──────────────────────────────────────────────────────────
const uploadThumbnail = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5   * 1024 * 1024 }  // 5MB
});

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }  // 100MB
});

const uploadPDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20  * 1024 * 1024 }  // 20MB
});

// Used for lesson file uploads (video OR pdf)
const uploadLesson = multer({
  storage,
  fileFilter: lessonFilter,
  limits: { fileSize: 100 * 1024 * 1024 }  // 100MB
});

// Export storage so other files can reference it
module.exports = {
  uploadThumbnail,
  uploadVideo,
  uploadPDF,
  uploadLesson,
  storage         // ← exported so moduleRoutes can reference it
};