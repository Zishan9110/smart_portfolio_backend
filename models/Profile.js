const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    designation: { type: String, default: '' },
    bio: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    profilePhoto: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    coverBanner: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    resume: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      geeksforgeeks: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    portfolioViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
