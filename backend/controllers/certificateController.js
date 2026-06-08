const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const CourseProgress = require('../models/CourseProgress');

const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CERT-${year}-${random}`;
};

const checkAndIssueCertificate = async (userId, courseId, userName = '') => {
  const course = await Course.findById(courseId);
  if (!course) return null;

  const existingCertificate = await Certificate.findOne({ userId, courseId });
  if (existingCertificate) return existingCertificate;

  const allLessons = [];

  course.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      allLessons.push({
        moduleId: module._id.toString(),
        lessonId: lesson._id.toString()
      });
    });
  });

  const progress = await CourseProgress.findOne({ userId, courseId });

  const completedLessons = progress?.completedLessons || [];

  const allLessonsCompleted = allLessons.every(item =>
    completedLessons.some(done =>
      done.moduleId.toString() === item.moduleId &&
      done.lessonId.toString() === item.lessonId
    )
  );

  if (!allLessonsCompleted) return null;

  const quizzes = await Quiz.find({
    courseId,
    isActive: true
  });

  const allQuizzesPassed = await Promise.all(
    quizzes.map(async quiz => {
      const passedAttempt = await QuizAttempt.findOne({
        quizId: quiz._id,
        userId,
        passed: true
      });

      return !!passedAttempt;
    })
  );

  if (allQuizzesPassed.includes(false)) return null;

  const certificate = await Certificate.create({
    certificateId: generateCertificateId(),
    userId,
    courseId,
    studentName: userName,
    courseTitle: course.title
  });

  return certificate;
};

const getMyCertificateForCourse = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    res.status(200).json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificate'
    });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const isOwner = certificate.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to download this certificate'
      });
    }

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${certificate.certificateId}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(34)
      .text('Certificate of Completion', {
        align: 'center'
      });

    doc.moveDown(1.5);

    doc
      .fontSize(18)
      .text('This certificate is proudly presented to', {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(30)
      .text(certificate.studentName, {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(18)
      .text('for successfully completing the course', {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(26)
      .text(certificate.courseTitle, {
        align: 'center'
      });

    doc.moveDown(1.5);

    doc
      .fontSize(14)
      .text(`Issued On: ${certificate.issuedAt.toDateString()}`, {
        align: 'center'
      });

    doc
      .fontSize(14)
      .text(`Certificate ID: ${certificate.certificateId}`, {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Verify this certificate at: /verify/${certificate.certificateId}`, {
        align: 'center'
      });

    doc.end();

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating certificate'
    });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    }).select('certificateId studentName courseTitle issuedAt');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying certificate'
    });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title category')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      certificates
    });

  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates'
    });
  }
};

module.exports = {
  checkAndIssueCertificate,
  getMyCertificateForCourse,
  downloadCertificate,
  verifyCertificate,
  getAllCertificates
};