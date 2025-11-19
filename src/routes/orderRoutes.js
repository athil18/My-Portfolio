const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/orderController');
const auth = require('../middleware/auth');

// @route   POST api/orders
// @desc    Place an order
// @access  Private
router.post('/', auth, placeOrder);

module.exports = router;
