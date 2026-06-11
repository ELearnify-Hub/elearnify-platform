const ContactMessage = require('../models/ContactMessage');

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone = '', category = 'general', subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required',
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      category,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. Our support team will contact you soon.',
      contactMessage,
    });
  } catch (error) {
    console.error('Contact message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
    });
  }
};

exports.updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const contactMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contactMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Support message updated',
      contactMessage,
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update message' });
  }
};
