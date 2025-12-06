const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Update users without track
async function addTrackToUsers() {
  try {
    console.log('\n🔄 Starting migration...\n');

    // Find all users who don't have a track field or have null track
    const usersWithoutTrack = await User.find({
      $or: [
        { track: { $exists: false } },
        { track: null }
      ]
    });

    console.log(`📊 Found ${usersWithoutTrack.length} users without track\n`);

    if (usersWithoutTrack.length === 0) {
      console.log('✅ All users already have tracks!');
      return;
    }

    // Update each user
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithoutTrack) {
      // Only add track to 3rd and 4th year BSIT/BSCS students
      if ((user.year === '3rd' || user.year === '4th') && 
          (user.program === 'BSIT' || user.program === 'BSCS')) {
        
        // Set default track based on program
        let defaultTrack = 'WMAD'; // Default for BSIT
        if (user.program === 'BSCS') {
          defaultTrack = 'IS'; // Default for BSCS
        }

        user.track = defaultTrack;
        await user.save();
        
        console.log(`✅ Updated: ${user.fullName} (${user.program} ${user.year}) → Track: ${defaultTrack}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${user.fullName} (${user.program} ${user.year}) - Not 3rd/4th year or not BSIT/BSCS`);
        skippedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    await addTrackToUsers();
    
    console.log('🎉 All done! Closing connection...\n');
    await mongoose.connection.close();
    console.log('👋 Connection closed. Goodbye!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
