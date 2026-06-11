const express = require('express');
const {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} = require('../controllers/contactController');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', protect, adminOnly, getContactMessages);
router.patch('/:id/status', protect, adminOnly, updateContactMessageStatus);

module.exports = router;
