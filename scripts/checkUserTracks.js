const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function checkTracks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}, 'fullName program year track email');
    
    console.log('📊 All Users and Their Tracks:\n');
    users.forEach(user => {
      console.log(`👤 ${user.fullName}`);
      console.log(`   Program: ${user.program}`);
      console.log(`   Year: ${user.year}`);
      console.log(`   Track: ${user.track || 'NO TRACK'}`);
      console.log(`   Email: ${user.email}`);
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTracks();
