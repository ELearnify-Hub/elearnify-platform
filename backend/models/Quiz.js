// models/Quiz.js
const mongoose = require('mongoose');

// ── Question Schema ───────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  text: {
    type:     String,
    required: [true, 'Question text is required'],
    trim:     true
  },

  options: {
    type:     [String],
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message:   'A question must have between 2 and 6 options'
    }
  },

  // Index of the correct option (0-based)
  correctIndex: {
    type:     Number,
    required: [true, 'Correct answer index is required'],
    min:      0
  },

  // Shown to student after they submit
  explanation: {
    type:    String,
    default: ''
  },

  // Points this question is worth (for weighted scoring later)
  points: {
    type:    Number,
    default: 1
  }
}, { _id: true });

// ── Quiz Schema ───────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Quiz title is required'],
      trim:     true
    },

    description: {
      type:    String,
      default: ''
    },

    // Which course this quiz belongs to
    courseId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true
    },

    // Which module this quiz is attached to (null = course-level quiz)
    moduleId: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null
    },

    questions: {
      type:     [questionSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message:   'Quiz must have at least 1 question'
      }
    },

    // Minimum score to pass (percentage)
    passingScore: {
      type:    Number,
      default: 70,
      min:     [1,   'Passing score must be at least 1%'],
      max:     [100, 'Passing score cannot exceed 100%']
    },

    // Time limit in minutes (0 = no limit)
    timeLimit: {
      type:    Number,
      default: 0
    },

    allowRetry: {
      type:    Boolean,
      default: true
    },

    // 0 = unlimited retries
    maxAttempts: {
      type:    Number,
      default: 0
    },

    // Whether to show correct answers after submission
    showAnswers: {
      type:    Boolean,
      default: true
    },

    // Whether to shuffle question order per attempt
    shuffleQuestions: {
      type:    Boolean,
      default: false
    },

    isActive: {
      type:    Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;