const asyncHandler = require('../middleware/asyncHandler');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const Profile = require('../models/Profile');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

// @desc    Get dashboard statistics cards data
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalProjects,
    featuredProjects,
    totalSkills,
    totalExperience,
    totalEducation,
    totalCertifications,
    totalAchievements,
    unreadMessages,
    profile,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ featured: true }),
    Skill.countDocuments(),
    Experience.countDocuments(),
    Education.countDocuments(),
    Certification.countDocuments(),
    Achievement.countDocuments(),
    Contact.countDocuments({ isRead: false }),
    Profile.findOne(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      featuredProjects,
      totalSkills,
      totalExperience,
      totalEducation,
      totalCertifications,
      totalAchievements,
      unreadMessages,
      portfolioViews: profile?.portfolioViews || 0,
    },
  });
});

// @desc    Get project analytics (views per project, category breakdown)
// @route   GET /api/dashboard/project-analytics
// @access  Private/Admin
exports.getProjectAnalytics = asyncHandler(async (req, res) => {
  const [topViewed, categoryBreakdown] = await Promise.all([
    Project.find().sort({ views: -1 }).limit(5).select('title views'),
    Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      topViewed,
      categoryBreakdown: categoryBreakdown.map((c) => ({ category: c._id || 'Uncategorized', count: c.count })),
    },
  });
});

// @desc    Get skills analytics (breakdown by category with avg proficiency)
// @route   GET /api/dashboard/skills-analytics
// @access  Private/Admin
exports.getSkillsAnalytics = asyncHandler(async (req, res) => {
  const breakdown = await Skill.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgProficiency: { $avg: '$proficiency' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: breakdown.map((b) => ({
      category: b._id,
      count: b.count,
      avgProficiency: Math.round(b.avgProficiency),
    })),
  });
});

// @desc    Get portfolio views analytics (current total; can be extended with time-series later)
// @route   GET /api/dashboard/views-analytics
// @access  Private/Admin
exports.getViewsAnalytics = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne();
  const projects = await Project.find().select('title views').sort({ views: -1 }).limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalPortfolioViews: profile?.portfolioViews || 0,
      topProjectsByViews: projects,
    },
  });
});

// @desc    Get recent admin activity feed
// @route   GET /api/dashboard/activities
// @access  Private/Admin
exports.getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(limit);
  res.status(200).json({ success: true, count: activities.length, data: activities });
});
