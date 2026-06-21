const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    position: { type: String, required: [true, 'Position is required'], trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // null/undefined means "Present"
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: '' },
    technologies: [{ type: String, trim: true }],
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
