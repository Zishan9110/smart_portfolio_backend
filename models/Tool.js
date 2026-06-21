const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Tool name is required'], trim: true },
    icon: { type: String, default: '' }, // icon key or uploaded image URL
    category: { type: String, default: 'General', trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tool', toolSchema);
