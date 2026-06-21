const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, logout, getMe, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);

module.exports = router;
