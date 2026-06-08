// models/QuizAttempt.js
// Records each time a student attempts a quiz
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Quiz',
      required: true
    },

    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    courseId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true
    },

    // Student's selected option index per question
    // e.g. [0, 2, 1, 3] = selected option 0 for Q1, option 2 for Q2, etc.
    answers: [
      {
        questionId:    { type: mongoose.Schema.Types.ObjectId },
        selectedIndex: { type: Number, default: -1 }
        // -1 = not answered (time ran out)
      }
    ],

    // Percentage score e.g. 85.5
    score: {
      type: Number,
      min:  0,
      max:  100
    },

    // Number of correct answers
    correctCount: {
      type: Number,
      default: 0
    },

    passed: {
      type: Boolean,
      default: false
    },

    // Which attempt number this is (1st, 2nd, 3rd...)
    attemptNumber: {
      type:    Number,
      default: 1
    },

    // Time taken in seconds
    timeTaken: {
      type:    Number,
      default: 0
    },

    completedAt: {
      type:    Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// ── Compound index: one record per user/quiz/attempt ──────────────────────────
quizAttemptSchema.index({ quizId: 1, userId: 1, attemptNumber: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;