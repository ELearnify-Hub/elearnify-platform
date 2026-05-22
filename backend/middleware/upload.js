 // middleware/upload.js — Multer File Upload Configuration
// Multer is middleware that handles multipart/form-data
// (the format used for file uploads in HTML forms)

const multer = require('multer');
const path = require('path');

// ─── Storage Configuration ────────────────────────────────────────────────────
// diskStorage tells Multer: "Save files to disk (not memory)"

const storage = multer.diskStorage({
  // destination: which folder to save uploaded files
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Save to the uploads/ directory
  },

  // filename: what to name the saved file
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    // Example: video-1712345678900.mp4
    // Without this, uploading two "video.mp4" files would overwrite each other
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// ─── File Filter ──────────────────────────────────────────────────────────────
// Validates file type BEFORE saving
// Rejects files that don't match our allowed types

const fileFilter = (req, file, cb) => {
  // Define allowed MIME types for each category
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  const pdfTypes = ['application/pdf'];

  const allowed = [...imageTypes, ...videoTypes, ...pdfTypes];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // Accept the file
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// ─── Size Limits ──────────────────────────────────────────────────────────────
const limits = {
  fileSize: 100 * 1024 * 1024  // 100MB max file size
};

// ─── Export Configured Multer Instances ───────────────────────────────────────

// For thumbnail images
const uploadThumbnail = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for images
});

// For video files
const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
});

// For PDF files
const uploadPDF = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB for PDFs
});

module.exports = { uploadThumbnail, uploadVideo, uploadPDF };
