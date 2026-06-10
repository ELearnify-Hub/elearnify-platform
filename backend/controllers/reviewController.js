// controllers/reviewController.js
const Review = require('../models/Review');
const Course = require('../models/Course');
const User   = require('../models/User');

// ── @route  POST /api/reviews/:courseId ───────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const courseId = req.params.courseId;
    const userId   = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Must be enrolled
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses
      .map(id => id.toString())
      .includes(courseId);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to review this course'
      });
    }

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
      { courseId, userId },
      { rating, title: title || '', body: body || '' },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: 'Review submitted', review });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/reviews/:courseId ────────────────────────────────────────
const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      courseId:   req.params.courseId,
      isApproved: true
    })
    .populate('userId', 'name avatar profilePicture')
    .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { distribution[r.rating]++; });

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        avgRating:    Number(avgRating),
        totalReviews: reviews.length,
        distribution
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  DELETE /api/reviews/:courseId ─────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      courseId: req.params.courseId,
      userId:   req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false, message: 'Review not found'
      });
    }

    res.status(200).json({ success: true, message: 'Review deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  GET /api/reviews/:courseId/my-review ──────────────────────────────
const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      courseId: req.params.courseId,
      userId:   req.user._id
    });
    res.status(200).json({ success: true, review: review || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createReview, getCourseReviews, deleteReview, getMyReview };