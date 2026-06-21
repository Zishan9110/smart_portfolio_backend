const asyncHandler = require('../middleware/asyncHandler');
const Education = require('../models/Education');
const Experience = require('../models/Experience');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

// @desc    Get unified timeline combining education, experience, certifications, achievements
// @route   GET /api/timeline
// @access  Public
exports.getTimeline = asyncHandler(async (req, res) => {
  const [education, experience, certifications, achievements] = await Promise.all([
    Education.find(),
    Experience.find(),
    Certification.find(),
    Achievement.find(),
  ]);

  const timeline = [
    ...education.map((e) => ({
      type: 'education',
      id: e._id,
      title: e.degree,
      subtitle: e.institution,
      description: e.description,
      date: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
    })),
    ...experience.map((e) => ({
      type: 'experience',
      id: e._id,
      title: e.position,
      subtitle: e.company,
      description: e.description,
      date: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
    })),
    ...certifications.map((c) => ({
      type: 'certification',
      id: c._id,
      title: c.name,
      subtitle: c.organization,
      description: '',
      date: c.issueDate,
      image: c.image?.url,
    })),
    ...achievements.map((a) => ({
      type: 'achievement',
      id: a._id,
      title: a.title,
      subtitle: '',
      description: a.description,
      date: a.date,
      image: a.badgeImage?.url,
    })),
  ];

  // Sort descending by date (most recent first)
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({ success: true, count: timeline.length, data: timeline });
});
