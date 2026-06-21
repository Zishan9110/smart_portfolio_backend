const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  submitContact
);

router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
