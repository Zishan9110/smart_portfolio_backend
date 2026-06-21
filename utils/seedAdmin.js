require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');

const seedAdmin = async () => {
  try {
    await connectDB();

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user.');
      process.exit(1);
    }

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists. Skipping creation.`);
    } else {
      await User.create({
        name: ADMIN_NAME || 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin user created successfully: ${ADMIN_EMAIL}`);
    }

    // Ensure a Profile document exists so the dashboard/public site has something to render
    const profileExists = await Profile.findOne();
    if (!profileExists) {
      await Profile.create({
        name: ADMIN_NAME || 'Admin',
        email: ADMIN_EMAIL,
      });
      console.log('Initial empty profile document created.');
    }

    console.log('Seed complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
