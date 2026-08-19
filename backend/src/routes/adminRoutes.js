const express = require('express');
const router = express.Router();
const {
  getUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  createUser,
  sendCredentialEmail
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

router.get('/users', getUsers);
router.post('/users/create', createUser);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/send-email', sendCredentialEmail);

module.exports = router;
