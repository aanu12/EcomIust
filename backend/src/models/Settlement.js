const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    amountDue: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'transferred'],
      default: 'pending'
    },
    paymentDetailsSnapshot: {
      upiId: { type: String, default: '' },
      bankAccountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' }
    },
    transferredAt: {
      type: Date
    },
    payoutReference: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settlement', settlementSchema);
