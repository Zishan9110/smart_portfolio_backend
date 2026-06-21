const Activity = require('../models/Activity');

/**
 * Logs an admin activity for the dashboard "Recent Activities" feed.
 * Fails silently (logs to console) so it never breaks the main request flow.
 */
const logActivity = async (action, module, description) => {
  try {
    await Activity.create({ action, module, description });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
