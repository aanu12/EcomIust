const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get user profile, wallet balance, transactions & payment details
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: {
        user,
        walletBalance: user.walletBalance || 0,
        paymentDetails: user.paymentDetails || {},
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment/bank details
 * @route   PUT /api/profile/payment-details
 * @access  Private
 */
const updatePaymentDetails = async (req, res, next) => {
  try {
    const { upiId, bankAccountName, accountNumber, ifscCode, bankName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    user.paymentDetails = {
      upiId: upiId ? upiId.trim() : (user.paymentDetails?.upiId || ''),
      bankAccountName: bankAccountName ? bankAccountName.trim() : (user.paymentDetails?.bankAccountName || ''),
      accountNumber: accountNumber ? accountNumber.trim() : (user.paymentDetails?.accountNumber || ''),
      ifscCode: ifscCode ? ifscCode.trim() : (user.paymentDetails?.ifscCode || ''),
      bankName: bankName ? bankName.trim() : (user.paymentDetails?.bankName || '')
    };

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Payment details updated successfully.',
      data: user.paymentDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change Password Flow
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password, new password, and confirm password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'New password and confirm password do not match.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'New password must be at least 6 characters long.'
      });
    }

    // Retrieve user including hashed password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect current password.'
      });
    }

    // Assign new password (pre-save middleware handles bcrypt hashing)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updatePaymentDetails,
  changePassword
};
