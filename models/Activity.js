const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "created", "updated", "deleted"
    module: { type: String, required: true }, // e.g. "Project", "Skill", "Profile"
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-expire activity logs after 90 days to keep the collection lean
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Activity', activitySchema);
