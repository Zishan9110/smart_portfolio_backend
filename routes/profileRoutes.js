const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadCoverBanner,
  uploadResume,
  incrementPortfolioViews,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

router.get('/', getProfile);
router.post('/view', incrementPortfolioViews);

router.put('/', protect, authorize('admin'), updateProfile);
router.put('/photo', protect, authorize('admin'), uploadImage.single('photo'), uploadProfilePhoto);
router.put('/banner', protect, authorize('admin'), uploadImage.single('banner'), uploadCoverBanner);
router.put('/resume', protect, authorize('admin'), uploadResumeMiddleware.single('resume'), uploadResume);

module.exports = router;
