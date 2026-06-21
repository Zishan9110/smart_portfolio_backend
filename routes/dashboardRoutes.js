const express = require('express');
const router = express.Router();
const {
  getStats,
  getProjectAnalytics,
  getSkillsAnalytics,
  getViewsAnalytics,
  getRecentActivities,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/project-analytics', getProjectAnalytics);
router.get('/skills-analytics', getSkillsAnalytics);
router.get('/views-analytics', getViewsAnalytics);
router.get('/activities', getRecentActivities);

module.exports = router;
