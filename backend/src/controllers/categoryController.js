const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

/**
 * Upload image buffer to Cloudinary in EcomIust/categories folder
 */
const uploadToCloudinary = (fileBuffer, folder = 'EcomIust/categories') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_')) {
      return reject(new Error('Cloudinary storage is not configured.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Category Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * @desc    Get active categories for public Home page
 * @route   GET /api/categories
 * @access  Public
 */
const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories for admin management
 * @route   GET /api/categories/admin
 * @access  Private/Admin
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Category name is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Category image is required.' });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'EcomIust/categories');
    const imageData = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    };

    const categoryIsActive = isActive !== undefined ? (isActive !== 'false' && isActive !== false) : true;

    const category = await Category.create({
      name: name.trim(),
      image: imageData,
      order: order !== undefined ? parseInt(order, 10) : 0,
      isActive: categoryIsActive
    });

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully!',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (name, image, order, isActive)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, order, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    }

    if (name) category.name = name.trim();
    if (order !== undefined) category.order = parseInt(order, 10);
    if (isActive !== undefined) {
      category.isActive = (isActive === 'true' || isActive === true);
    }

    // If replacement image file uploaded, delete old Cloudinary image and upload new one
    if (req.file) {
      if (category.image && category.image.public_id && !category.image.public_id.startsWith('local_')) {
        try {
          await cloudinary.uploader.destroy(category.image.public_id);
          console.log(`🗑️ Deleted old Cloudinary category image: ${category.image.public_id}`);
        } catch (err) {
          console.error('Old category Cloudinary deletion error:', err.message);
        }
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'EcomIust/categories');
      category.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    await category.save();

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category & remove its Cloudinary image asset
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    }

    // Delete image asset from Cloudinary
    if (category.image && category.image.public_id && !category.image.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
        console.log(`🗑️ Deleted category Cloudinary image: ${category.image.public_id}`);
      } catch (err) {
        console.error('Category Cloudinary deletion error:', err.message);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Category and Cloudinary asset deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
