const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Meetpoint = require('../models/Meetpoint');
const Settlement = require('../models/Settlement');
const Product = require('../models/Product');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const createCheckoutSession = async (req, res, next) => {
  try {
    const { meetpointId } = req.body;

    if (!meetpointId) {
      return res.status(400).json({ status: 'fail', message: 'Please select a campus meetpoint.' });
    }

    const meetpointDoc = await Meetpoint.findById(meetpointId);
    if (!meetpointDoc || !meetpointDoc.isActive) {
      return res.status(400).json({ status: 'fail', message: 'Selected meetpoint is invalid or inactive.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'seller', select: 'name email' }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Your cart is empty.' });
    }

    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product || item.product.status !== 'approved') {
        return res.status(400).json({
          status: 'fail',
          message: `Product "${item.product ? item.product.name : 'Unknown'}" is no longer available.`
        });
      }

      // Prevent seller from buying their own product listing
      const sellerId = item.product.seller._id ? item.product.seller._id.toString() : item.product.seller.toString();
      if (sellerId === req.user._id.toString()) {
        return res.status(400).json({
          status: 'fail',
          message: `You cannot purchase your own product listing "${item.product.name}".`
        });
      }

      const itemTotal = item.product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        product: item.product._id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        seller: item.product.seller._id || item.product.seller
      });
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      items: orderItems,
      subtotal: calculatedSubtotal,
      totalAmount: calculatedSubtotal,
      meetpoint: {
        name: meetpointDoc.name,
        landmark: meetpointDoc.landmark,
        instructions: meetpointDoc.instructions || ''
      },
      paymentStatus: 'pending',
      orderStatus: 'pending',
      paymentMethod: 'Razorpay Test'
    });

    return res.status(201).json({
      status: 'success',
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Test Payment Outcome:
 * When paid, CREDITS seller wallet balance and creates Credit WalletTransaction + Pending Settlement!
 */
const verifyTestPayment = async (req, res, next) => {
  try {
    const { orderId, paymentOutcome = 'success' } = req.body;

    const order = await Order.findById(orderId).populate('buyer', 'name email');
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    if (paymentOutcome === 'failure') {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();

      return res.status(400).json({
        status: 'fail',
        message: 'Payment transaction failed. Please retry checkout.',
        orderId: order._id
      });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.transactionId = `TXN-RAZORPAY-${Date.now()}`;
    await order.save();

    // Clear Buyer's Cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Process Seller Wallet Credit & Pending Settlement for each purchased item
    for (const item of order.items) {
      const sellerAmount = item.price * item.quantity;
      const sellerUser = await User.findById(item.seller);

      if (sellerUser) {
        // 1. CREDIT seller's wallet balance upon successful order completion!
        sellerUser.walletBalance = (sellerUser.walletBalance || 0) + sellerAmount;
        await sellerUser.save();

        // 2. Create WalletTransaction (type = credit)
        await WalletTransaction.create({
          user: sellerUser._id,
          type: 'credit',
          amount: sellerAmount,
          description: `Marketplace sale earnings for Order #${order.orderNumber}`,
          referenceOrder: order._id
        });

        // 3. Create Settlement (status = pending)
        await Settlement.create({
          seller: sellerUser._id,
          order: order._id,
          product: item.product,
          amountDue: sellerAmount,
          status: 'pending',
          paymentDetailsSnapshot: {
            upiId: sellerUser.paymentDetails?.upiId || '',
            bankAccountName: sellerUser.paymentDetails?.bankAccountName || '',
            accountNumber: sellerUser.paymentDetails?.accountNumber || '',
            ifscCode: sellerUser.paymentDetails?.ifscCode || ''
          }
        });
      }
    }

    // Trigger Automated Order Confirmation Email
    if (order.buyer && order.buyer.email) {
      sendOrderConfirmationEmail({
        buyerEmail: order.buyer.email,
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        meetpoint: order.meetpoint
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Payment verified! Order confirmed, seller wallet credited, and receipt email sent.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id, archivedByUser: false })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Soft-Delete / Archive Order (`DELETE /api/orders/my-orders/:id`)
 * Soft-deletes from user UI view without destroying financial or settlement audit records!
 */
const archiveUserOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to modify this order.' });
    }

    order.archivedByUser = true;
    await order.save();

    return res.status(200).json({
      status: 'success',
      message: 'Order archived from your account view. Financial audit records remain safely preserved.'
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email course')
      .populate('items.seller', 'name email course');

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to view this order.' });
    }

    return res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getAllAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email course')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  verifyTestPayment,
  getMyOrders,
  archiveUserOrder,
  getOrderById,
  getAllAdminOrders
};
