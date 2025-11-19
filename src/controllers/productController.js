const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};
