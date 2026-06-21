const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Certification = require('../models/Certification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logActivity = require('../utils/logActivity');

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
exports.getCertifications = asyncHandler(async (req, res) => {
  const items = await Certification.find().sort({ issueDate: -1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Public
exports.getCertification = asyncHandler(async (req, res, next) => {
  const item = await Certification.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Certification not found', 404));
  res.status(200).json({ success: true, data: item });
});

// @desc    Create certification
// @route   POST /api/certifications
// @access  Private/Admin
exports.createCertification = asyncHandler(async (req, res, next) => {
  const { name, organization, issueDate, credentialUrl, displayOrder } = req.body;

  if (!name || !organization || !issueDate) {
    return next(new ErrorResponse('Name, organization and issue date are required', 400));
  }

  let image = {};
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'certifications');
    image = { url: result.url, public_id: result.public_id };
  }

  const item = await Certification.create({
    name,
    organization,
    issueDate,
    credentialUrl,
    image,
    displayOrder: displayOrder || 0,
  });

  await logActivity('created', 'Certification', `Certification "${item.name}" was created`);
  res.status(201).json({ success: true, data: item });
});

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private/Admin
exports.updateCertification = asyncHandler(async (req, res, next) => {
  const item = await Certification.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Certification not found', 404));

  const { name, organization, issueDate, credentialUrl, displayOrder } = req.body;
  if (name !== undefined) item.name = name;
  if (organization !== undefined) item.organization = organization;
  if (issueDate !== undefined) item.issueDate = issueDate;
  if (credentialUrl !== undefined) item.credentialUrl = credentialUrl;
  if (displayOrder !== undefined) item.displayOrder = displayOrder;

  if (req.file) {
    if (item.image && item.image.public_id) {
      await deleteFromCloudinary(item.image.public_id);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'certifications');
    item.image = { url: result.url, public_id: result.public_id };
  }

  await item.save();
  await logActivity('updated', 'Certification', `Certification "${item.name}" was updated`);
  res.status(200).json({ success: true, data: item });
});

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private/Admin
exports.deleteCertification = asyncHandler(async (req, res, next) => {
  const item = await Certification.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Certification not found', 404));

  if (item.image && item.image.public_id) {
    await deleteFromCloudinary(item.image.public_id);
  }

  await item.deleteOne();
  await logActivity('deleted', 'Certification', `Certification "${item.name}" was deleted`);
  res.status(200).json({ success: true, data: {} });
});
