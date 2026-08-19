const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyTestPayment,
  getMyOrders,
  archiveUserOrder,
  getOrderById,
  getAllAdminOrders
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/checkout', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyTestPayment);
router.get('/my-orders', protect, getMyOrders);
router.delete('/my-orders/:id', protect, archiveUserOrder);
router.get('/admin/all', protect, adminOnly, getAllAdminOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
