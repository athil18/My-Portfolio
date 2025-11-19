const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById } = require('../controllers/productController');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', getAllProducts);

// @route   GET api/products/:id
// @desc    Get a product by ID
// @access  Public
router.get('/:id', getProductById);

module.exports = router;
