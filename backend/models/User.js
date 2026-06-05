 // models/User.js — Blueprint for every user in our database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Define the Schema ────────────────────────────────────────────────────────
// A schema is like a form template — it defines what fields exist
// and what rules they follow

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],      // Custom error message
      trim: true,                                  // Removes extra spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                                // No two users can have same email
      lowercase: true,                             // Always stored as lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false                                // NEVER return password in queries by default
    },

    role: {
      type: String,
      enum: ['student', 'admin'],                  // Only these two values allowed
      default: 'student'                           // Every new user is a student by default
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,      // Reference to a Course document
        ref: 'Course'                              // Links to our Course model
      }
    ],

    profilePicture: {
      type: String,
      default: ''
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    passwordResetToken: {
      type: String,
      default: null,
      // We store the HASHED token here — never the plain token
      // Same security principle as passwords
    },

    passwordResetExpires: {
      type: Date,
      default: null
      // Stores when the token expires
      // We check: is current time BEFORE this date?
    }
  },
  {
    timestamps: true   // Automatically adds createdAt and updatedAt fields
  }
);

// ─── Pre-Save Middleware (Password Hashing) ───────────────────────────────────
// This runs AUTOMATICALLY before every .save() call
// It hashes the password so we NEVER store plain text passwords in the DB

userSchema.pre('save', async function (next) {
  // 'this' refers to the current user document being saved

  // IMPORTANT: Only hash if password was actually changed
  // Without this check, every profile update would re-hash the already-hashed password
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // bcrypt.genSalt(10) — generates a "salt" (random data added to password before hashing)
    // The number 10 is the "cost factor" — higher = more secure but slower
    // 10 is the industry standard balance between security and performance
    const salt = await bcrypt.genSalt(10);

    // Replace the plain text password with the hashed version
    this.password = await bcrypt.hash(this.password, salt);

    next(); // Continue to save
  } catch (error) {
    next(error); // Pass error to Express error handler
  }
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
// This method is available on every user document
// We call it during login to check if entered password matches stored hash
// Usage: const isMatch = await user.comparePassword('enteredPassword')

userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare() hashes the entered password and compares with stored hash
  // Returns true if they match, false if not
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Create and Export the Model ─────────────────────────────────────────────
// mongoose.model('User', userSchema) creates a 'users' collection in MongoDB
// (Mongoose automatically pluralizes and lowercases the name)

const User = mongoose.model('User', userSchema);

module.exports = User;
