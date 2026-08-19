const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const { sendProductApprovedEmail, sendProductRejectedEmail } = require('../services/emailService');

const uploadToCloudinary = (fileBuffer, folder = 'EcomIust/products') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_')) {
      return reject(new Error('Cloudinary storage is not configured properly in backend environment.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Product Upload Error:', error);
          return reject(new Error(error.message || 'Failed to upload image to Cloudinary.'));
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteCloudinaryAssets = async (images = []) => {
  for (const img of images) {
    if (img && img.public_id && !img.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        console.log(`🗑️ Deleted product Cloudinary image: ${img.public_id}`);
      } catch (err) {
        console.error(`Failed to delete Cloudinary asset ${img.public_id}:`, err.message);
      }
    }
  }
};

const getApprovedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'approved' })
      .populate('category', 'name slug')
      .populate('seller', 'name course email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'approved', isFeatured: true })
      .populate('category', 'name slug')
      .populate('seller', 'name course email')
      .sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    }

    const products = await Product.find({ category: categoryId, status: 'approved' })
      .populate('category', 'name slug')
      .populate('seller', 'name course email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        image: category.image
      },
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug image')
      .populate('seller', 'name course email status');

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, condition, category, specifications } = req.body;

    if (!name || !price || !description || !condition || !category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, price, description, condition, and category are required.'
      });
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ status: 'fail', message: 'Selected category does not exist.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'At least one product image is required.' });
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'EcomIust/products'));
    const uploadResults = await Promise.all(uploadPromises);

    const images = uploadResults.map((res) => ({
      url: res.secure_url,
      public_id: res.public_id
    }));

    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecs = [];
      }
    }

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      condition,
      category,
      images,
      specifications: parsedSpecs,
      seller: req.user._id,
      status: 'pending',
      isAdminProduct: false,
      isFeatured: false
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name course email');

    return res.status(201).json({
      status: 'success',
      message: 'Product submitted successfully! It is pending admin verification.',
      data: populatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Updates Own Product Listing (`PUT /api/products/my/:id`)
 * Supports selective removal of existing images & appending newly uploaded images.
 */
const updateMyProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to edit this product.' });
    }

    const { name, price, description, condition, category, specifications, removedImageIds } = req.body;

    if (name) product.name = name.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (description) product.description = description.trim();
    if (condition) product.condition = condition;

    if (category) {
      const existingCat = await Category.findById(category);
      if (existingCat) product.category = category;
    }

    if (specifications) {
      try {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        // preserve existing
      }
    }

    // 1. Process Removed Existing Images
    let currentImages = product.images || [];
    let toRemoveList = [];
    if (removedImageIds) {
      try {
        toRemoveList = typeof removedImageIds === 'string' ? JSON.parse(removedImageIds) : removedImageIds;
      } catch (e) {
        toRemoveList = [];
      }
    }

    if (Array.isArray(toRemoveList) && toRemoveList.length > 0) {
      const removedObjects = currentImages.filter((img) => toRemoveList.includes(img.public_id));
      await deleteCloudinaryAssets(removedObjects);
      currentImages = currentImages.filter((img) => !toRemoveList.includes(img.public_id));
    }

    // 2. Process Newly Uploaded Images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'EcomIust/products'));
      const uploadResults = await Promise.all(uploadPromises);
      newImages = uploadResults.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
    }

    const combinedImages = [...currentImages, ...newImages];
    if (combinedImages.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'At least one product image is required.' });
    }

    product.images = combinedImages;

    // Reset status to pending and unfeature on user edit
    product.status = 'pending';
    product.isFeatured = false;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name course email');

    return res.status(200).json({
      status: 'success',
      message: 'Listing updated! It has returned to pending status for admin re-review.',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Deletes Own Product Listing (`DELETE /api/products/my/:id`)
 */
const deleteMyProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to delete this product.' });
    }

    await deleteCloudinaryAssets(product.images);
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Listing deleted and associated Cloudinary images purged.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN SPECIFIC CONTROLLERS
// ==========================================

const getAllAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('seller', 'name course email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Updates Any Product (`PUT /api/admin/products/:id`)
 */
const updateAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    const { name, price, description, condition, category, specifications, isFeatured, status, removedImageIds } = req.body;

    if (name) product.name = name.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (description) product.description = description.trim();
    if (condition) product.condition = condition;
    if (status) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (category) {
      const existingCat = await Category.findById(category);
      if (existingCat) product.category = category;
    }

    if (specifications) {
      try {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        // preserve existing
      }
    }

    // 1. Process Removed Existing Images
    let currentImages = product.images || [];
    let toRemoveList = [];
    if (removedImageIds) {
      try {
        toRemoveList = typeof removedImageIds === 'string' ? JSON.parse(removedImageIds) : removedImageIds;
      } catch (e) {
        toRemoveList = [];
      }
    }

    if (Array.isArray(toRemoveList) && toRemoveList.length > 0) {
      const removedObjects = currentImages.filter((img) => toRemoveList.includes(img.public_id));
      await deleteCloudinaryAssets(removedObjects);
      currentImages = currentImages.filter((img) => !toRemoveList.includes(img.public_id));
    }

    // 2. Process Newly Uploaded Images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'EcomIust/products'));
      const uploadResults = await Promise.all(uploadPromises);
      newImages = uploadResults.map((r) => ({ url: r.secure_url, public_id: r.public_id }));
    }

    const combinedImages = [...currentImages, ...newImages];
    if (combinedImages.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'At least one product image is required.' });
    }

    product.images = combinedImages;
    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name course email');

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully by Admin.',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

const createAdminProduct = async (req, res, next) => {
  try {
    const { name, price, description, condition, category, specifications, isFeatured } = req.body;

    if (!name || !price || !description || !condition || !category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, price, description, condition, and category are required.'
      });
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ status: 'fail', message: 'Selected category does not exist.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'At least one product image is required.' });
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'EcomIust/products'));
    const uploadResults = await Promise.all(uploadPromises);

    const images = uploadResults.map((res) => ({
      url: res.secure_url,
      public_id: res.public_id
    }));

    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecs = [];
      }
    }

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      condition,
      category,
      images,
      specifications: parsedSpecs,
      seller: req.user._id,
      status: 'approved',
      isAdminProduct: true,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name course email');

    return res.status(201).json({
      status: 'success',
      message: 'Admin Assured product created successfully!',
      data: populatedProduct
    });
  } catch (error) {
    next(error);
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    product.status = 'approved';
    await product.save();

    if (product.seller && product.seller.email) {
      sendProductApprovedEmail({
        sellerEmail: product.seller.email,
        sellerName: product.seller.name,
        productName: product.name,
        productId: product._id
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Product approved successfully and approval email sent to seller!',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const rejectProduct = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    product.status = 'rejected';
    if (reason) product.rejectionReason = reason.trim();
    await product.save();

    if (product.seller && product.seller.email) {
      sendProductRejectedEmail({
        sellerEmail: product.seller.email,
        sellerName: product.seller.name,
        productName: product.name,
        reason: product.rejectionReason
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Product rejected.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const toggleFeaturedProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    if (product.status !== 'approved') {
      return res.status(400).json({ status: 'fail', message: 'Only approved products can be marked as Featured.' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    return res.status(200).json({
      status: 'success',
      message: `Product is now ${product.isFeatured ? 'Featured' : 'unfeatured'}.`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found.' });
    }

    await deleteCloudinaryAssets(product.images);
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted by Admin and Cloudinary assets purged.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
