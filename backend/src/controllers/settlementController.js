const Settlement = require('../models/Settlement');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { sendSettlementTransferredEmail } = require('../services/emailService');

const getAdminSettlements = async (req, res, next) => {
  try {
    const settlements = await Settlement.find()
      .populate('seller', 'name email course paymentDetails')
      .populate('order', 'orderNumber paymentStatus createdAt')
      .populate('product', 'name price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: settlements.length,
      data: settlements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Transfers Settlement Payout (`PUT /api/admin/settlements/:id/transfer`)
 * DEBITS seller's wallet balance (since funds leave marketplace wallet to external bank/UPI)
 * and records a Debit WalletTransaction ledger entry!
 */
const transferSettlement = async (req, res, next) => {
  try {
    const { payoutReference, adminNotes } = req.body;
    const settlement = await Settlement.findById(req.params.id)
      .populate('seller', 'name email walletBalance paymentDetails')
      .populate('order', 'orderNumber');

    if (!settlement) {
      return res.status(404).json({ status: 'fail', message: 'Settlement record not found.' });
    }

    if (settlement.status === 'transferred') {
      return res.status(400).json({ status: 'fail', message: 'Settlement has already been marked as transferred.' });
    }

    settlement.status = 'transferred';
    settlement.transferredAt = new Date();
    settlement.payoutReference = payoutReference ? payoutReference.trim() : `UTR-${Date.now()}`;
    if (adminNotes) settlement.adminNotes = adminNotes.trim();
    await settlement.save();

    // DEBIT Seller Wallet Balance & Record Debit Transaction Ledger Entry
    const seller = await User.findById(settlement.seller._id);
    if (seller) {
      // Wallet Balance = Credits - Debits
      seller.walletBalance = Math.max(0, (seller.walletBalance || 0) - settlement.amountDue);
      await seller.save();

      await WalletTransaction.create({
        user: seller._id,
        type: 'debit',
        amount: settlement.amountDue,
        description: `Payout transferred to bank/UPI for Order #${settlement.order?.orderNumber || 'SALE'} (Ref: ${settlement.payoutReference})`,
        referenceSettlement: settlement._id
      });
    }

    // Trigger Automated Payout Transferred Email to Seller
    if (seller && seller.email) {
      sendSettlementTransferredEmail({
        sellerEmail: seller.email,
        sellerName: seller.name,
        amount: settlement.amountDue,
        orderNumber: settlement.order?.orderNumber || 'SALE'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Settlement marked as transferred! Seller wallet debited for payout and notification email dispatched.',
      data: settlement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminSettlements,
  transferSettlement
};
