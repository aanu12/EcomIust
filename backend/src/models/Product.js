const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be non-negative']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['New', 'Old', 'Used'],
      default: 'Used'
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
      }
    ],
    specifications: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true }
      }
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isAdminProduct: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for fast category & status queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
