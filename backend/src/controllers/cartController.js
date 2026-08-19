const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out products that were deleted or are no longer approved
    const validItems = cart.items.filter(
      (item) => item.product && item.product.status === 'approved'
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Calculate backend subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return res.status(200).json({
      status: 'success',
      subtotal,
      itemCount: cart.items.length,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product || product.status !== 'approved') {
      return res.status(400).json({
        status: 'fail',
        message: 'This product is unavailable or pending verification.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += parseInt(quantity, 10);
    } else {
      cart.items.push({
        product: productId,
        quantity: parseInt(quantity, 10),
        priceAtAddition: product.price
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    return res.status(200).json({
      status: 'success',
      message: 'Product added to cart!',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/item
 * @access  Private
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ status: 'fail', message: 'Valid productId and quantity ≥ 1 are required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'Cart not found.' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Item not in cart.' });
    }

    item.quantity = parseInt(quantity, 10);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    return res.status(200).json({
      status: 'success',
      message: 'Cart quantity updated.',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/item/:productId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');

    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart
};
