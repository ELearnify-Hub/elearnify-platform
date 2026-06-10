// models/ChatHistory.js
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    reply: {
      type: String,
      required: true
    },

    pageContext: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
