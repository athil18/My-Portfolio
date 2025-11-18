
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logout);

module.exports = router;
