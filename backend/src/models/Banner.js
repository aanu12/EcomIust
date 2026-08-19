const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    desktopImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    mobileImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    },
    linkUrl: {
      type: String,
      default: '',
      trim: true
    },
    order: {
      type: Number,
      default: 0
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

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
