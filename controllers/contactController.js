const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');

// @desc    Submit contact form (public)
// @route   POST /api/contact
// @access  Public
exports.submitContact = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return next(new ErrorResponse('Name, email and message are required', 400));
  }

  const contact = await Contact.create({ name, email, subject, message });

  // Best-effort email notification; never blocks the response on failure
  if (process.env.CONTACT_RECEIVER_EMAIL) {
    sendEmail({
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `New Portfolio Contact: ${subject || 'No subject'}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      replyTo: email,
    }).catch((err) => console.error('Email notification failed:', err.message));
  }

  await logActivity('created', 'Contact', `New message received from ${name}`);

  res.status(201).json({ success: true, data: contact });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: contacts.length, data: contacts });
});

// @desc    Mark a message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!contact) return next(new ErrorResponse('Message not found', 404));
  res.status(200).json({ success: true, data: contact });
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return next(new ErrorResponse('Message not found', 404));
  await contact.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
