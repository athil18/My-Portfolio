const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

exports.placeOrder = async (req, res, next) => {
  const { products } = req.body;

  try {
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(new ErrorResponse(`Product with id ${item.productId} not found`, 404));
      }
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user.id,
      products: products.map(p => ({ product: p.productId, quantity: p.quantity })),
      totalAmount,
    });

    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};
