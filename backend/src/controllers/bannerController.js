const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

/**
 * Upload image buffer to Cloudinary in a target folder
 */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_')) {
      console.warn('⚠️ Cloudinary not configured.');
      return reject(new Error('Cloudinary storage is not configured.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary Upload Error (${folder}):`, error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * @desc    Get active banners for public Home page carousel
 * @route   GET /api/banners
 * @access  Public
 */
const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all banners for admin management
 * @route   GET /api/banners/admin
 * @access  Private/Admin
 */
const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new banner with desktop and mobile Cloudinary uploads
 * @route   POST /api/banners
 * @access  Private/Admin
 */
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, linkUrl, order, isActive } = req.body;

    const desktopFile = req.files && req.files.desktopImage ? req.files.desktopImage[0] : null;
    const mobileFile = req.files && req.files.mobileImage ? req.files.mobileImage[0] : null;

    if (!desktopFile || !mobileFile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Both Desktop (1920x600px) and Mobile (1080x1350px) banner images are required.'
      });
    }

    // Upload to separate Cloudinary folders: EcomIust/banners/desktop and EcomIust/banners/mobile
    const [desktopUpload, mobileUpload] = await Promise.all([
      uploadToCloudinary(desktopFile.buffer, 'EcomIust/banners/desktop'),
      uploadToCloudinary(mobileFile.buffer, 'EcomIust/banners/mobile')
    ]);

    // Ensure isActive defaults to true unless explicitly set to false
    const bannerIsActive = isActive !== undefined ? (isActive !== 'false' && isActive !== false) : true;

    const banner = await Banner.create({
      title: title ? title.trim() : '',
      subtitle: subtitle ? subtitle.trim() : '',
      linkUrl: linkUrl ? linkUrl.trim() : '',
      order: order !== undefined ? parseInt(order, 10) : 0,
      isActive: bannerIsActive,
      desktopImage: {
        url: desktopUpload.secure_url,
        public_id: desktopUpload.public_id
      },
      mobileImage: {
        url: mobileUpload.secure_url,
        public_id: mobileUpload.public_id
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Banner uploaded and created successfully!',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update banner details (title, text, order, isActive toggle)
 * @route   PUT /api/banners/:id
 * @access  Private/Admin
 */
const updateBanner = async (req, res, next) => {
  try {
    const { title, subtitle, linkUrl, order, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ status: 'fail', message: 'Banner not found.' });
    }

    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (linkUrl !== undefined) banner.linkUrl = linkUrl.trim();
    if (order !== undefined) banner.order = parseInt(order, 10);
    if (isActive !== undefined) banner.isActive = isActive;

    await banner.save();

    return res.status(200).json({
      status: 'success',
      message: 'Banner updated successfully.',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete banner & delete Cloudinary assets for desktop and mobile
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ status: 'fail', message: 'Banner not found.' });
    }

    // Delete desktop image from Cloudinary
    if (banner.desktopImage && banner.desktopImage.public_id && !banner.desktopImage.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(banner.desktopImage.public_id);
        console.log(`🗑️ Deleted desktop banner Cloudinary image: ${banner.desktopImage.public_id}`);
      } catch (err) {
        console.error('Desktop Cloudinary deletion error:', err.message);
      }
    }

    // Delete mobile image from Cloudinary
    if (banner.mobileImage && banner.mobileImage.public_id && !banner.mobileImage.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(banner.mobileImage.public_id);
        console.log(`🗑️ Deleted mobile banner Cloudinary image: ${banner.mobileImage.public_id}`);
      } catch (err) {
        console.error('Mobile Cloudinary deletion error:', err.message);
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Banner and Cloudinary assets deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
