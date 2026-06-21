const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Certificate name is required'], trim: true },
    organization: { type: String, required: [true, 'Organization is required'], trim: true },
    issueDate: { type: Date, required: true },
    credentialUrl: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', certificationSchema);
