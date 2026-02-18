const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/uploadProject');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinaryConfig');
require('dotenv').config();

// Test user IDs to delete
const TEST_USER_IDS = [
  '69325d8a95465855721c2772', // Ron Enrick R. Religioso
  '6933b31fee13b60041294c5d', // TESTING USER
  '69387ad7c172dca4aadb417a'  // TRY TRY
];

async function cleanupTestUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const userId of TEST_USER_IDS) {
      console.log(`\n🗑️ Deleting user: ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        console.log(`⚠️ User ${userId} not found, skipping...`);
        continue;
      }

      console.log(`   User: ${user.fullName} (${user.email})`);

      // Get all user's projects
      const projects = await Project.find({ userId });
      console.log(`   Found ${projects.length} projects`);

      // Delete all project images from Cloudinary
      for (const project of projects) {
        console.log(`   📦 Deleting project: ${project.projectName}`);
        
        // Delete thumbnail
        if (project.thumbnailUrl?.public_id) {
          try {
            const result = await cloudinary.uploader.destroy(project.thumbnailUrl.public_id);
            console.log(`      ✅ Thumbnail deleted: ${result.result}`);
          } catch (err) {
            console.error(`      ❌ Failed to delete thumbnail:`, err.message);
          }
        }

        // Delete other images
        if (project.otherImages && project.otherImages.length > 0) {
          for (const img of project.otherImages) {
            if (img.public_id) {
              try {
                const result = await cloudinary.uploader.destroy(img.public_id);
                console.log(`      ✅ Image deleted: ${result.result}`);
              } catch (err) {
                console.error(`      ❌ Failed to delete image:`, err.message);
              }
            }
          }
        }
      }

      // Delete profile picture from Cloudinary
      if (user.profilePicture?.public_id) {
        try {
          const result = await cloudinary.uploader.destroy(user.profilePicture.public_id);
          console.log(`   ✅ Profile picture deleted: ${result.result}`);
        } catch (err) {
          console.error(`   ❌ Failed to delete profile picture:`, err.message);
        }
      }

      // Get project IDs for related data deletion
      const projectIds = projects.map(p => p._id);

      // Delete all related data
      console.log('   🗑️ Deleting related data...');
      
      const deleteResults = await Promise.all([
        // Delete user's projects
        Project.deleteMany({ userId }),
        
        // Delete comments by user
        Comment.deleteMany({ userId }),
        
        // Delete likes by user
        Like.deleteMany({ userId }),
        
        // Delete views by user
        View.deleteMany({ userId }),
        
        // Delete comments on user's projects
        Comment.deleteMany({ projectId: { $in: projectIds } }),
        
        // Delete likes on user's projects
        Like.deleteMany({ projectId: { $in: projectIds } }),
        
        // Delete views on user's projects
        View.deleteMany({ projectId: { $in: projectIds } }),
        
        // Delete notifications sent to user
        Notification.deleteMany({ recipientId: userId }),
        
        // Delete notifications from user
        Notification.deleteMany({ senderId: userId })
      ]);

      console.log(`   ✅ Deleted:`);
      console.log(`      - ${deleteResults[0].deletedCount} projects`);
      console.log(`      - ${deleteResults[1].deletedCount} comments by user`);
      console.log(`      - ${deleteResults[2].deletedCount} likes by user`);
      console.log(`      - ${deleteResults[3].deletedCount} views by user`);
      console.log(`      - ${deleteResults[4].deletedCount} comments on projects`);
      console.log(`      - ${deleteResults[5].deletedCount} likes on projects`);
      console.log(`      - ${deleteResults[6].deletedCount} views on projects`);
      console.log(`      - ${deleteResults[7].deletedCount} notifications to user`);
      console.log(`      - ${deleteResults[8].deletedCount} notifications from user`);

      // Delete the user account
      await User.findByIdAndDelete(userId);
      console.log(`   ✅ User account deleted`);
    }

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestUsers();
