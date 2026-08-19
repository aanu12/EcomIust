const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary SDK using environment variables.
 * NEVER hardcode Cloudinary credentials in code.
 */
const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || CLOUDINARY_CLOUD_NAME.includes('your_')) {
    console.warn('⚠️ Cloudinary is not fully configured in environment variables.');
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });

  console.log('✅ Cloudinary initialized successfully.');
  return true;
};

module.exports = { cloudinary, configureCloudinary };
