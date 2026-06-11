const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');

const VALID_STATUSES = ['scheduled', 'live', 'completed', 'cancelled'];
const VALID_PROVIDERS = ['jitsi', 'google_meet', 'zoom', 'custom'];

const createRoomName = (title = 'live-class') => {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);

  return `elearnify-${safeTitle || 'class'}-${Date.now()}`;
};

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isAdmin = (user) => user?.role === 'admin';
const isInstructor = (user) => user?.role === 'instructor';

const canManageClass = (user, liveClass) => {
  if (isAdmin(user)) return true;
  if (!isInstructor(user)) return false;
  return String(liveClass.instructor?._id || liveClass.instructor) === String(user._id);
};

const buildMeetingLink = ({ provider, meetingLink, roomName }) => {
  if (provider === 'jitsi') return `https://meet.jit.si/${roomName}`;
  return meetingLink || '';
};

exports.createLiveClass = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      scheduledAt,
      durationMinutes,
      provider = 'jitsi',
      meetingLink = '',
      agenda,
      resources,
    } = req.body;

    if (!title || !course || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and scheduled date/time are required',
      });
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid live class provider',
      });
    }

    if (provider !== 'jitsi' && !meetingLink.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting link is required for Google Meet, Zoom, or custom classes',
      });
    }

    const foundCourse = await Course.findById(course);

    if (!foundCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const instructorId = isInstructor(req.user)
      ? req.user._id
      : foundCourse.createdBy || req.user._id;

    const roomName = createRoomName(title);

    const liveClass = await LiveClass.create({
      title: title.trim(),
      description: description || '',
      course,
      instructor: instructorId,
      createdBy: req.user._id,
      scheduledAt,
      durationMinutes: Number(durationMinutes) || 60,
      provider,
      meetingLink: buildMeetingLink({ provider, meetingLink: meetingLink.trim(), roomName }),
      roomName,
      agenda: normalizeArray(agenda),
      resources: normalizeArray(resources),
    });

    const populatedClass = await liveClass.populate([
      { path: 'course', select: 'title category thumbnail' },
      { path: 'instructor', select: 'name email role' },
      { path: 'createdBy', select: 'name email role' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Live class created successfully',
      liveClass: populatedClass,
    });
  } catch (error) {
    console.error('Create live class error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create live class',
    });
  }
};

exports.getLiveClasses = async (req, res) => {
  try {
    const query = {};

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }

    if (req.query.course) {
      query.course = req.query.course;
    }

    const liveClasses = await LiveClass.find(query)
      .populate('course', 'title category thumbnail')
      .populate('instructor', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      liveClasses,
    });
  } catch (error) {
    console.error('Get live classes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live classes',
    });
  }
};

exports.getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('course', 'title category thumbnail')
      .populate('instructor', 'name email role')
      .populate('createdBy', 'name email role');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    return res.status(200).json({
      success: true,
      liveClass,
    });
  } catch (error) {
    console.error('Get live class error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live class',
    });
  }
};

exports.updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (!canManageClass(req.user, liveClass)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own live classes',
      });
    }

    const allowedFields = [
      'title',
      'description',
      'course',
      'scheduledAt',
      'durationMinutes',
      'provider',
      'meetingLink',
      'recordingUrl',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        liveClass[field] = req.body[field];
      }
    });

    if (req.body.provider && !VALID_PROVIDERS.includes(req.body.provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid live class provider',
      });
    }

    if (req.body.agenda !== undefined) liveClass.agenda = normalizeArray(req.body.agenda);
    if (req.body.resources !== undefined) liveClass.resources = normalizeArray(req.body.resources);

    if (liveClass.provider === 'jitsi') {
      liveClass.meetingLink = `https://meet.jit.si/${liveClass.roomName}`;
    } else if (!liveClass.meetingLink) {
      return res.status(400).json({
        success: false,
        message: 'Meeting link is required for this provider',
      });
    }

    await liveClass.save();

    const populatedClass = await LiveClass.findById(liveClass._id)
      .populate('course', 'title category thumbnail')
      .populate('instructor', 'name email role')
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      liveClass: populatedClass,
    });
  } catch (error) {
    console.error('Update live class error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update live class',
    });
  }
};

exports.updateLiveClassStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid live class status',
      });
    }

    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (!canManageClass(req.user, liveClass)) {
      return res.status(403).json({
        success: false,
        message: 'You can only control your own live classes',
      });
    }

    liveClass.status = status;
    await liveClass.save();

    return res.status(200).json({
      success: true,
      message: 'Live class status updated',
      liveClass,
    });
  } catch (error) {
    console.error('Update live class status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update live class',
    });
  }
};

exports.deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found',
      });
    }

    if (!canManageClass(req.user, liveClass)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own live classes',
      });
    }

    await liveClass.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Live class deleted successfully',
    });
  } catch (error) {
    console.error('Delete live class error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete live class',
    });
  }
};
