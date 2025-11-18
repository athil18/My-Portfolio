
const express = require('express');
const router = express.Router();
const passport = require('passport');
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

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

module.exports = router;
