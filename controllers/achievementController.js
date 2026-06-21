const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Achievement = require('../models/Achievement');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logActivity = require('../utils/logActivity');

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
exports.getAchievements = asyncHandler(async (req, res) => {
  const items = await Achievement.find().sort({ date: -1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Public
exports.getAchievement = asyncHandler(async (req, res, next) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Achievement not found', 404));
  res.status(200).json({ success: true, data: item });
});

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private/Admin
exports.createAchievement = asyncHandler(async (req, res, next) => {
  const { title, description, date, displayOrder } = req.body;

  if (!title || !date) {
    return next(new ErrorResponse('Title and date are required', 400));
  }

  let badgeImage = {};
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'achievements');
    badgeImage = { url: result.url, public_id: result.public_id };
  }

  const item = await Achievement.create({
    title,
    description,
    date,
    badgeImage,
    displayOrder: displayOrder || 0,
  });

  await logActivity('created', 'Achievement', `Achievement "${item.title}" was created`);
  res.status(201).json({ success: true, data: item });
});

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private/Admin
exports.updateAchievement = asyncHandler(async (req, res, next) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Achievement not found', 404));

  const { title, description, date, displayOrder } = req.body;
  if (title !== undefined) item.title = title;
  if (description !== undefined) item.description = description;
  if (date !== undefined) item.date = date;
  if (displayOrder !== undefined) item.displayOrder = displayOrder;

  if (req.file) {
    if (item.badgeImage && item.badgeImage.public_id) {
      await deleteFromCloudinary(item.badgeImage.public_id);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'achievements');
    item.badgeImage = { url: result.url, public_id: result.public_id };
  }

  await item.save();
  await logActivity('updated', 'Achievement', `Achievement "${item.title}" was updated`);
  res.status(200).json({ success: true, data: item });
});

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
exports.deleteAchievement = asyncHandler(async (req, res, next) => {
  const item = await Achievement.findById(req.params.id);
  if (!item) return next(new ErrorResponse('Achievement not found', 404));

  if (item.badgeImage && item.badgeImage.public_id) {
    await deleteFromCloudinary(item.badgeImage.public_id);
  }

  await item.deleteOne();
  await logActivity('deleted', 'Achievement', `Achievement "${item.title}" was deleted`);
  res.status(200).json({ success: true, data: {} });
});
