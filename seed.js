// seed.js — Create default doctor and receptionist accounts
// Run: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

async function seed() {
  // support either variable for backwards-compatibility
  const mongoUrl = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/doctors-cares';
  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');

  const accounts = [
    { name: 'Dr. John Smith',      username: 'doctor',       password: 'doctor123',      role: 'doctor'       },
    { name: 'Sarah (Receptionist)',username: 'receptionist',  password: 'reception123',   role: 'receptionist' },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ username: acc.username });
    if (existing) {
      console.log(`${acc.username} already exists — skipping`);
    } else {
      await User.create(acc);
      console.log(`Created: ${acc.username} (${acc.role}) — password: ${acc.password}`);
    }
  }

  console.log('\n Seed complete!');
  console.log('   Doctor login:      username=doctor       password=doctor123');
  console.log('   Receptionist login: username=receptionist password=reception123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
