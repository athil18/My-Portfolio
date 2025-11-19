const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res, next) => {
  const { products } = req.body;

  try {
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product with id ${item.productId} not found` });
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
