const express = require('express');
const router = express.Router();
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getAchievements);
router.get('/:id', getAchievement);
router.post('/', protect, authorize('admin'), uploadImage.single('badgeImage'), createAchievement);
router.put('/:id', protect, authorize('admin'), uploadImage.single('badgeImage'), updateAchievement);
router.delete('/:id', protect, authorize('admin'), deleteAchievement);

module.exports = router;
