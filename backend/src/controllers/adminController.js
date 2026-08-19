const crypto = require('crypto');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { sendEmail } = require('../config/smtp');

/**
 * Helper to generate a clean, secure random password for users
 */
const generateSecurePassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  return password;
};

/**
 * @desc    Get all users / registrations
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { role: { $ne: 'admin' } }; // Exclude admin accounts from list

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a pending user registration
 * @route   PUT /api/admin/users/:id/approve
 * @access  Private/Admin
 */
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User registration not found.' });
    }

    // Generate secure password for approved student
    const generatedPassword = generateSecurePassword(10);
    user.password = generatedPassword;
    user.status = 'approved';
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'User registration approved successfully!',
      generatedPassword,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a user registration & delete Cloudinary ID image
 * @route   PUT /api/admin/users/:id/reject
 * @access  Private/Admin
 */
const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User registration not found.' });
    }

    // Delete uploaded ID image from Cloudinary if public_id exists
    if (user.idCard && user.idCard.public_id && !user.idCard.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(user.idCard.public_id);
        console.log(`🗑️ Deleted Cloudinary ID image: ${user.idCard.public_id}`);
      } catch (err) {
        console.error('Cloudinary Deletion Error:', err.message);
      }
    }

    user.status = 'rejected';
    user.idCard = { url: '', public_id: '' };
    if (req.body.reason) {
      user.rejectionReason = req.body.reason;
    }
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'User registration rejected and ID image removed from Cloudinary.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details (Name, Course, Email)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, course, email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (course) user.course = course.trim();
    if (email) user.email = email.trim().toLowerCase();

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'User details updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user record & associated Cloudinary assets
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    // Delete associated Cloudinary ID asset if present
    if (user.idCard && user.idCard.public_id && !user.idCard.public_id.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(user.idCard.public_id);
        console.log(`🗑️ Deleted user Cloudinary ID asset: ${user.idCard.public_id}`);
      } catch (err) {
        console.error('Cloudinary Deletion Error:', err.message);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'User record and associated Cloudinary ID assets deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually create an approved user (Admin creation)
 * @route   POST /api/admin/users/create
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, course, email } = req.body;

    if (!name || !course || !email) {
      return res.status(400).json({ status: 'fail', message: 'Name, Course, and Email are required.' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'A user with this email already exists.' });
    }

    const generatedPassword = generateSecurePassword(10);

    const newUser = await User.create({
      name: name.trim(),
      course: course.trim(),
      email: email.trim().toLowerCase(),
      password: generatedPassword,
      role: 'user',
      status: 'approved'
    });

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      generatedPassword,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        course: newUser.course,
        status: newUser.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send login credentials to user via SMTP Email
 * @route   POST /api/admin/users/:id/send-email
 * @access  Private/Admin
 */
const sendCredentialEmail = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    if (!password) {
      return res.status(400).json({ status: 'fail', message: 'Password is required to send credential email.' });
    }

    const emailSubject = '🎓 IUST Ecom - Account Approved & Login Credentials';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Welcome to IUST Ecom!</h2>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your student verification has been approved for <strong>${user.course}</strong>.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Registered Email:</strong> ${user.email}</p>
          <p style="margin: 0;"><strong>Generated Password:</strong> <code style="font-size: 16px; background: #edf2f7; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>
        <p>Please log in using your registered email and password to access the campus marketplace.</p>
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">IUST Ecom Security Team</p>
      </div>
    `;

    const sent = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
      text: `Welcome to IUST Ecom! Email: ${user.email} | Password: ${password}`
    });

    return res.status(200).json({
      status: 'success',
      message: `Credentials email dispatched successfully to ${user.email}`,
      emailSent: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  createUser,
  sendCredentialEmail
};
