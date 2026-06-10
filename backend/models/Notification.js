// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'enrollment',   // Student enrolled in a course
        'quiz_result',  // Quiz submitted
        'certificate',  // Certificate issued
        'course_published', // Course published by instructor
        'new_review',   // New review on instructor's course
        'system'        // General platform notification
      ],
      required: true
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: '' },
    isRead:  { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;