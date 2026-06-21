const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Profile = require('../models/Profile');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logActivity = require('../utils/logActivity');

// Helper: there should only ever be one Profile document
const getOrCreateProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create({});
  }
  return profile;
};

// @desc    Get public profile
// @route   GET /api/profile
// @access  Public
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile();
  res.status(200).json({ success: true, data: profile });
});

// @desc    Update profile text fields + social links
// @route   PUT /api/profile
// @access  Private/Admin
exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile();

  const allowedFields = ['name', 'designation', 'bio', 'email', 'phone', 'location'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });

  if (req.body.socialLinks) {
    let socialLinks = req.body.socialLinks;
    if (typeof socialLinks === 'string') {
      try {
        socialLinks = JSON.parse(socialLinks);
      } catch {
        socialLinks = {};
      }
    }
    profile.socialLinks = { ...profile.socialLinks.toObject(), ...socialLinks };
  }

  await profile.save();
  await logActivity('updated', 'Profile', 'Profile information updated');

  res.status(200).json({ success: true, data: profile });
});

// @desc    Upload/replace profile photo
// @route   PUT /api/profile/photo
// @access  Private/Admin
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Please upload an image file', 400));

  const profile = await getOrCreateProfile();

  if (profile.profilePhoto && profile.profilePhoto.public_id) {
    await deleteFromCloudinary(profile.profilePhoto.public_id);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'profile-photo');
  profile.profilePhoto = { url: result.url, public_id: result.public_id };
  await profile.save();
  await logActivity('updated', 'Profile', 'Profile photo updated');

  res.status(200).json({ success: true, data: profile });
});

// @desc    Upload/replace cover banner
// @route   PUT /api/profile/banner
// @access  Private/Admin
exports.uploadCoverBanner = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Please upload an image file', 400));

  const profile = await getOrCreateProfile();

  if (profile.coverBanner && profile.coverBanner.public_id) {
    await deleteFromCloudinary(profile.coverBanner.public_id);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'cover-banner');
  profile.coverBanner = { url: result.url, public_id: result.public_id };
  await profile.save();
  await logActivity('updated', 'Profile', 'Cover banner updated');

  res.status(200).json({ success: true, data: profile });
});

// @desc    Upload/replace resume (PDF)
// @route   PUT /api/profile/resume
// @access  Private/Admin
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Please upload a PDF file', 400));

  const profile = await getOrCreateProfile();

  if (profile.resume && profile.resume.public_id) {
    await deleteFromCloudinary(profile.resume.public_id, 'raw');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'resume', 'raw');
  profile.resume = { url: result.url, public_id: result.public_id };
  await profile.save();
  await logActivity('updated', 'Profile', 'Resume updated');

  res.status(200).json({ success: true, data: profile });
});

// @desc    Increment portfolio view counter (called once per visitor session from public site)
// @route   POST /api/profile/view
// @access  Public
exports.incrementPortfolioViews = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile();
  profile.portfolioViews += 1;
  await profile.save();
  res.status(200).json({ success: true, views: profile.portfolioViews });
});
