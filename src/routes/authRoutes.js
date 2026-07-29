// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, resendOTP} = require('../controllers/authController');

// POST /auth/register
router.post('/register', register);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOTP);

router.post('/login', login);

router.post('/resend-otp', resendOTP);

module.exports = router;