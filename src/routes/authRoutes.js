const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    message: 'You are authenticated!',
    user: req.user,
  });
});

module.exports = router;