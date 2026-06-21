const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Skill name is required'], trim: true },
    icon: { type: String, default: '' }, // icon name/key (e.g. react-icons identifier) or uploaded image URL
    proficiency: {
      type: Number,
      required: [true, 'Proficiency is required'],
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Frontend',
        'Backend',
        'Database',
        'Cloud',
        'DevOps',
        'Programming Languages',
        'Tools',
      ],
    },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
