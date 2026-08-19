const express = require('express');
const router = express.Router();
const {
  getActiveMeetpoints,
  getAllAdminMeetpoints,
  createMeetpoint,
  updateMeetpoint,
  deleteMeetpoint
} = require('../controllers/meetpointController');
const { protect, adminOnly } = require('../middleware/auth');

// Public Route
router.get('/', getActiveMeetpoints);

// Admin Protected Routes
router.get('/admin/all', protect, adminOnly, getAllAdminMeetpoints);
router.post('/admin/create', protect, adminOnly, createMeetpoint);
router.put('/admin/:id', protect, adminOnly, updateMeetpoint);
router.delete('/admin/:id', protect, adminOnly, deleteMeetpoint);

module.exports = router;
