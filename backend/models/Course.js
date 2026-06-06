// models/Course.js
const mongoose = require('mongoose');

// ── Lesson Schema ─────────────────────────────────────────────────────────────
// A lesson is the smallest unit of content
// It belongs to a Module, which belongs to a Course
const lessonSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Lesson title is required'],
    trim:     true
  },

  type: {
    type:    String,
    enum:    ['video', 'pdf', 'text'],
    default: 'video'
  },

  // For video lessons
  filePath: {
    type:    String,
    default: ''
    // e.g. "uploads/video-1234567890.mp4"
  },

  duration: {
    type:    String,
    default: ''
    // e.g. "12:34" — displayed in lesson list
  },

  // For text lessons
  content: {
    type:    String,
    default: ''
    // Raw text or markdown content
  },

  // Controls whether students can preview without enrolling
  isFreePreview: {
    type:    Boolean,
    default: false
  },

  // Order within its module (for manual sorting)
  order: {
    type:    Number,
    default: 0
  }
}, { _id: true });
// _id: true → each lesson gets its own ID
// We need lesson IDs for progress tracking

// ── Module Schema ─────────────────────────────────────────────────────────────
// A module groups related lessons together
// e.g. "Module 1: Getting Started", "Module 2: Advanced Topics"
const moduleSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Module title is required'],
    trim:     true
  },

  description: {
    type:    String,
    default: ''
  },

  order: {
    type:    Number,
    default: 0
    // Used to sort modules within a course
  },

  lessons: [lessonSchema]
  // Array of lessons inside this module
}, { _id: true });

// ── Course Schema ─────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Course title is required'],
      trim:      true,
      minlength: [5,   'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type:      String,
      required:  [true, 'Description is required'],
      minlength: [20,   'Description must be at least 20 characters']
    },

    instructor: {
      type:     String,
      required: [true, 'Instructor name is required'],
      trim:     true
    },

    thumbnail: {
      type:    String,
      default: ''
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development', 'Mobile Development', 'Data Science',
        'Machine Learning', 'Design', 'Business', 'Other'
      ]
    },

    level: {
      type:    String,
      enum:    ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },

    price: {
      type:    Number,
      default: 0,
      min:     [0, 'Price cannot be negative']
    },

    duration: {
      type:    String,
      default: ''
      // Overall course duration e.g. "12 hours"
    },

    // ── NEW: Modules array (replaces videos[] and pdfs[]) ────────────────────
    modules: [moduleSchema],

    // ── Keep these for backward compatibility during migration ────────────────
    // We'll phase them out after Phase B is stable
    videos: [
      {
        title:    { type: String },
        filePath: { type: String },
        duration: { type: String, default: '' }
      }
    ],

    pdfs: [
      {
        title:    { type: String },
        filePath: { type: String }
      }
    ],

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User'
      }
    ],

    isPublished: {
      type:    Boolean,
      default: false
    },

    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },

    // ── What students will learn (bullet points) ─────────────────────────────
    whatYouLearn: [
      { type: String, trim: true }
    ],

    // ── Requirements / prerequisites ─────────────────────────────────────────
    requirements: [
      { type: String, trim: true }
    ]
  },
  {
    timestamps: true
  }
);

// ── Virtual: Total lessons count ──────────────────────────────────────────────
// Safely handles courses created before modules existed
courseSchema.virtual('totalLessons').get(function () {
  const modules = this.modules || [];

  return modules.reduce((total, mod) => {
    return total + (mod.lessons || []).length;
  }, 0);
});

// ── Virtual: Total video lessons ──────────────────────────────────────────────
// Counts only video lessons across all modules
courseSchema.virtual('totalVideos').get(function () {
  const modules = this.modules || [];

  return modules.reduce((total, mod) => {
    const lessons = mod.lessons || [];

    return total + lessons.filter(
      lesson => lesson.type === 'video'
    ).length;
  }, 0);
});

// ── Text index for search ─────────────────────────────────────────────────────
courseSchema.index({ title: 'text', description: 'text' });

// Include virtuals when converting to JSON
courseSchema.set('toJSON',   { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;