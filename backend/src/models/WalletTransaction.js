const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be non-negative']
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    referenceSettlement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settlement'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
