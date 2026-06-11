const express = require('express');
const {
  createLiveClass,
  getLiveClasses,
  getLiveClassById,
  updateLiveClass,
  updateLiveClassStatus,
  deleteLiveClass,
} = require('../controllers/liveClassController');

const { protect, instructorOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getLiveClasses);
router.get('/:id', protect, getLiveClassById);
router.post('/', protect, instructorOrAdmin, createLiveClass);
router.put('/:id', protect, instructorOrAdmin, updateLiveClass);
router.patch('/:id/status', protect, instructorOrAdmin, updateLiveClassStatus);
router.delete('/:id', protect, instructorOrAdmin, deleteLiveClass);

module.exports = router;
