const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/auth');

// Multer memory storage with file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed for banners.'), false);
    }
  }
});

const bannerUpload = upload.fields([
  { name: 'desktopImage', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 }
]);

// Public routes
router.get('/', getActiveBanners);

// Protected Admin-only routes
router.get('/admin', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, bannerUpload, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
