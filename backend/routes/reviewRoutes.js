// routes/reviewRoutes.js
const express = require('express');
const router  = express.Router({ mergeParams: true });
const {
  createReview, getCourseReviews,
  deleteReview, getMyReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/',          getCourseReviews);
router.get('/my-review', protect, getMyReview);
router.post('/',         protect, createReview);
router.delete('/',       protect, deleteReview);

module.exports = router;