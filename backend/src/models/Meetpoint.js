const mongoose = require('mongoose');

const meetpointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Meetpoint name is required'],
      trim: true
    },
    landmark: {
      type: String,
      required: [true, 'Landmark is required'],
      trim: true
    },
    instructions: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Meetpoint', meetpointSchema);
