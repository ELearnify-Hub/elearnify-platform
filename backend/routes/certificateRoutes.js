const express = require('express');
const router = express.Router();

const {
  getMyCertificateForCourse,
  downloadCertificate,
  verifyCertificate,
  getAllCertificates
} = require('../controllers/certificateController');

const { protect, adminOnly } = require('../middleware/auth');

router.get('/course/:courseId/my', protect, getMyCertificateForCourse);
router.get('/download/:certificateId', protect, downloadCertificate);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/admin/all', protect, adminOnly, getAllCertificates);

module.exports = router;