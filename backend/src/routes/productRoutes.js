const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getApprovedProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  getMyListings,
  createProduct,
  updateMyProduct,
  deleteMyProduct,
  getAllAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  approveProduct,
  rejectProduct,
  toggleFeaturedProduct,
  deleteAdminProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Multer memory storage configured for high-res camera photos (25MB limit per file, up to 10 images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, etc.) are allowed.'), false);
    }
  }
});

// Public Routes
router.get('/', getApprovedProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);

// User Protected Routes
router.get('/my-listings', protect, getMyListings);
router.get('/my', protect, getMyListings);
router.post('/', protect, upload.array('images', 10), createProduct);
router.put('/my/:id', protect, upload.array('images', 10), updateMyProduct);
router.put('/:id', protect, upload.array('images', 10), updateMyProduct);
router.delete('/my/:id', protect, deleteMyProduct);
router.delete('/:id', protect, deleteMyProduct);

// Single Product Details
router.get('/:id', getProductById);

// Admin Protected Routes
router.get('/admin/all', protect, adminOnly, getAllAdminProducts);
router.post('/admin/create', protect, adminOnly, upload.array('images', 10), createAdminProduct);
router.put('/admin/:id', protect, adminOnly, upload.array('images', 10), updateAdminProduct);
router.put('/admin/:id/approve', protect, adminOnly, approveProduct);
router.put('/admin/:id/reject', protect, adminOnly, rejectProduct);
router.put('/admin/:id/featured', protect, adminOnly, toggleFeaturedProduct);
router.delete('/admin/:id', protect, adminOnly, deleteAdminProduct);

module.exports = router;
