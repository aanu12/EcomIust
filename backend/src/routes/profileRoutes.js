const express = require('express');
const router = express.Router();
const {
  getProfile,
  updatePaymentDetails,
  changePassword
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProfile);
router.put('/payment-details', updatePaymentDetails);
router.put('/change-password', changePassword);

module.exports = router;
