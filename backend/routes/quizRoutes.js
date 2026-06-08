// routes/quizRoutes.js
const express = require('express');
const router  = express.Router();

const {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getMyResults,
  getAdminResults
} = require('../controllers/quizController');

const { protect, adminOnly } = require('../middleware/auth');

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post('/',                          protect, adminOnly, createQuiz);
router.put('/:quizId',                    protect, adminOnly, updateQuiz);
router.delete('/:quizId',                 protect, adminOnly, deleteQuiz);
router.get('/:quizId/admin-results',      protect, adminOnly, getAdminResults);

// ── Shared routes (auth required) ─────────────────────────────────────────────
router.get('/course/:courseId',           protect, getQuizzesByCourse);
router.get('/:quizId',                    protect, getQuizById);
router.post('/:quizId/submit',            protect, submitQuiz);
router.get('/:quizId/results',            protect, getMyResults);

module.exports = router;