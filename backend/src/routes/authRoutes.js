const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/register', upload.single('idImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
