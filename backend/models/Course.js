 // models/Course.js — Blueprint for every course in our database

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters']
    },

    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true
    },

    thumbnail: {
      type: String,        // Stores the file path, e.g., "uploads/thumbnail-123.jpg"
      default: ''
    },

    // A course can have multiple video lessons
    videos: [
      {
        title: {
          type: String,
          required: true
        },
        filePath: {
          type: String,    // e.g., "uploads/video-123.mp4"
          required: true
        },
        duration: {
          type: String,    // e.g., "12:34"
          default: ''
        }
      }
    ],

    // A course can have multiple PDF materials
    pdfs: [
      {
        title: {
          type: String,
          required: true
        },
        filePath: {
          type: String,    // e.g., "uploads/notes-123.pdf"
          required: true
        }
      }
    ],

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'Design',
        'Business',
        'Other'
      ]
    },

    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },

    price: {
      type: Number,
      default: 0,          // 0 means free
      min: [0, 'Price cannot be negative']
    },

    duration: {
      type: String,        // e.g., "10 hours"
      default: ''
    },

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'        // References User model
      }
    ],

    isPublished: {
      type: Boolean,
      default: false       // Admin must explicitly publish a course
    },

    // Who created this course (admin user)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true       // Adds createdAt and updatedAt automatically
  }
);

// ─── Index for Search ─────────────────────────────────────────────────────────
// This makes text search on title and description FAST
// Without index, MongoDB scans every document (slow for large datasets)
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
