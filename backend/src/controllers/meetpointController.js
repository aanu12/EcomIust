const Meetpoint = require('../models/Meetpoint');

/**
 * @desc    Get active meetpoints for Checkout (Public)
 * @route   GET /api/meetpoints
 */
const getActiveMeetpoints = async (req, res, next) => {
  try {
    const meetpoints = await Meetpoint.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      status: 'success',
      count: meetpoints.length,
      data: meetpoints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all meetpoints for Admin Management
 * @route   GET /api/admin/meetpoints
 */
const getAllAdminMeetpoints = async (req, res, next) => {
  try {
    const meetpoints = await Meetpoint.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: meetpoints.length,
      data: meetpoints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new Meetpoint (Admin Only)
 * @route   POST /api/admin/meetpoints
 */
const createMeetpoint = async (req, res, next) => {
  try {
    const { name, landmark, instructions, isActive } = req.body;

    if (!name || !landmark) {
      return res.status(400).json({ status: 'fail', message: 'Name and landmark are required.' });
    }

    const meetpoint = await Meetpoint.create({
      name: name.trim(),
      landmark: landmark.trim(),
      instructions: instructions ? instructions.trim() : '',
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      status: 'success',
      message: 'Meetpoint created successfully.',
      data: meetpoint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Meetpoint (Admin Only)
 * @route   PUT /api/admin/meetpoints/:id
 */
const updateMeetpoint = async (req, res, next) => {
  try {
    const { name, landmark, instructions, isActive } = req.body;
    const meetpoint = await Meetpoint.findById(req.params.id);

    if (!meetpoint) {
      return res.status(404).json({ status: 'fail', message: 'Meetpoint not found.' });
    }

    if (name) meetpoint.name = name.trim();
    if (landmark) meetpoint.landmark = landmark.trim();
    if (instructions !== undefined) meetpoint.instructions = instructions.trim();
    if (isActive !== undefined) meetpoint.isActive = isActive;

    await meetpoint.save();

    return res.status(200).json({
      status: 'success',
      message: 'Meetpoint updated successfully.',
      data: meetpoint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Meetpoint (Admin Only)
 * @route   DELETE /api/admin/meetpoints/:id
 */
const deleteMeetpoint = async (req, res, next) => {
  try {
    const meetpoint = await Meetpoint.findByIdAndDelete(req.params.id);
    if (!meetpoint) {
      return res.status(404).json({ status: 'fail', message: 'Meetpoint not found.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Meetpoint deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveMeetpoints,
  getAllAdminMeetpoints,
  createMeetpoint,
  updateMeetpoint,
  deleteMeetpoint
};
