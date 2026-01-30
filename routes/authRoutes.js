
const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard, forgotPassword, resetPassword, changePassword, createAdmin, listAdmins, demoteAdmin } = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');
const {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  createAdminValidation,
} = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/verify-otp', verifyOtpValidation, verifyOTP);
router.post('/resend-otp', forgotPasswordValidation, resendOTP);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/change-password', authMiddleware, changePasswordValidation, changePassword);
router.post('/create-admin', authMiddleware, createAdminValidation, createAdmin);
router.get('/admins', authMiddleware, listAdmins);
router.post('/demote-admin', authMiddleware, forgotPasswordValidation, demoteAdmin);
router.get('/dashboard', authMiddleware, dashboard);
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });
  return res.json({ user: req.session.user });
});

module.exports = router;
