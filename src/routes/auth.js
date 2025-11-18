
const express = require('express');
const router = express.Router();
const { register } = require('../controllers/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

module.exports = router;
