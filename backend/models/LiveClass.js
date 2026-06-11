const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: '',
      maxlength: 800,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 300,
    },

    provider: {
      type: String,
      enum: ['jitsi', 'google_meet', 'zoom', 'custom'],
      default: 'jitsi',
    },

    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },

    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    agenda: {
      type: [String],
      default: [],
    },

    resources: {
      type: [String],
      default: [],
    },

    recordingUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

liveClassSchema.index({ scheduledAt: 1, status: 1 });
liveClassSchema.index({ instructor: 1, scheduledAt: 1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);
