// controllers/notificationController.js
const Notification = require('../models/Notification');

// ── Helper: Create a notification ────────────────────────────────────────────
const createNotification = async ({ userId, type, title, message, link, metadata }) => {
  try {
    await Notification.create({ userId, type, title, message, link: link || '', metadata: metadata || {} });
  } catch (error) {
    console.error('Create notification error:', error.message);
  }
};

// ── @route  GET /api/notifications ───────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/notifications/read-all ───────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  PUT /api/notifications/:id/read ───────────────────────────────────
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── @route  DELETE /api/notifications ─────────────────────────────────────────
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAllRead,
  markOneRead,
  clearAll
};