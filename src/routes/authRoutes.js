// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, verifyOTP } = require('../controllers/auth.controller');

// POST /auth/register
router.post('/register', register);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOTP);

module.exports = router;