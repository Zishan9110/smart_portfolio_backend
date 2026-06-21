const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Achievement title is required'], trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    badgeImage: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
