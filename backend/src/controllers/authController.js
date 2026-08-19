const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');

/**
 * Helper to upload buffer to Cloudinary in dedicated folder
 */
const uploadToCloudinary = (fileBuffer, folder = 'EcomIust/users/ids') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_')) {
      console.warn('⚠️ Cloudinary not fully configured. Using local placeholder image.');
      return resolve({
        secure_url: `https://via.placeholder.com/800x600.png?text=Student+ID+Card`,
        public_id: `local_placeholder_${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * @desc    Register a new student user with ID card image upload
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({ status: 'fail', message: 'Name, Email, and Course are required fields.' });
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a valid email address.' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'An account or registration already exists with this email.' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Student ID document image is required for registration.' });
    }

    // Upload ID image to Cloudinary in dedicated folder EcomIust/users/ids
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(req.file.buffer, 'EcomIust/users/ids');
    } catch (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to upload ID document to image storage.' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      course: course.trim(),
      status: 'pending',
      role: 'user',
      idCard: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registration submitted successfully! Your ID card is pending admin verification.',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        course: newUser.course,
        status: newUser.status,
        idCardUrl: newUser.idCard.url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user / admin
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    // Check account verification status for student users
    if (user.role !== 'admin') {
      if (user.status === 'pending') {
        return res.status(403).json({
          status: 'fail',
          message: 'Your account registration is pending admin verification. You cannot log in yet.'
        });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({
          status: 'fail',
          message: 'Your registration request was rejected by the admin.'
        });
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role,
        status: user.status,
        idCardUrl: user.idCard ? user.idCard.url : ''
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
