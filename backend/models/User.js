// models/User.js — Blueprint for every user in our database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Define the Schema ────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },

    password: {
      type: String,
      // Remove 'required' — Google users have no password
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },

    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },

    // Instructor-specific fields
    instructorProfile: {
      bio: {
        type: String,
        default: ''
      },
      expertise: [
        {
          type: String
        }
      ],
      website: {
        type: String,
        default: ''
      },
      totalStudents: {
        type: Number,
        default: 0
      },
      totalRevenue: {
        type: Number,
        default: 0
      }
    },

    isApproved: {
      type: Boolean,
      default: false
      // Admin must approve instructor accounts
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],

    profilePicture: {
      type: String,
      default: ''
    },

    passwordResetToken: {
      type: String,
      default: null
      // Store the HASHED token here, never the plain token
    },

    passwordResetExpires: {
      type: Date,
      default: null
      // Stores when the reset token expires
    },

    // ── Google OAuth Fields ───────────────────────────────────────────────────────
    googleId: {
      type:    String,
      default: null
      // Google's unique user ID
      // Used to find user on subsequent OAuth logins
    },

    authProvider: {
      type:    String,
      enum:    ['local', 'google'],
      default: 'local'
      // 'local'  = registered with email/password
      // 'google' = registered via Google OAuth
    },

    avatar: {
      type:    String,
      default: ''
      // Profile picture URL from Google
    }

  },
  {
    timestamps: true
  }
);

// ─── Pre-Save Middleware: Password Hashing ────────────────────────────────────

userSchema.pre('save', async function (next) {
  // Skip hashing if:
  // 1. Password wasn't modified
  // 2. User has no password (Google OAuth user)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt   = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Method: Compare Password ────────────────────────────────────────

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Create and Export the Model ──────────────────────────────────────────────

const User = mongoose.model('User', userSchema);

module.exports = User;