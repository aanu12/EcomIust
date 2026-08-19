const express = require('express');
const router = express.Router();
const {
  getAdminSettlements,
  transferSettlement
} = require('../controllers/settlementController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin/all', protect, adminOnly, getAdminSettlements);
router.put('/admin/:id/transfer', protect, adminOnly, transferSettlement);

module.exports = router;
