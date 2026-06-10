// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    courseId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5
    },
    title: {
      type:    String,
      trim:    true,
      maxlength: 100,
      default: ''
    },
    body: {
      type:    String,
      trim:    true,
      maxlength: 1000,
      default: ''
    },
    isApproved: {
      type:    Boolean,
      default: true
      // Auto-approve for now; admin can moderate
    }
  },
  { timestamps: true }
);

// One review per user per course
reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;