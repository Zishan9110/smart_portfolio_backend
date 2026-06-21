const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: String, default: 'Web Development', trim: true },
    technologies: [{ type: String, trim: true }],
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Project', projectSchema);
