// routes/aiRoutes.js
const express = require('express');
const {
  askAI,
  getAIRecommendations,
  getChatHistory,
  generateQuizIdeas
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/ask', protect, askAI);
router.get('/recommendations', protect, getAIRecommendations);
router.get('/history', protect, getChatHistory);
router.post('/quiz-ideas', protect, generateQuizIdeas);

module.exports = router;
