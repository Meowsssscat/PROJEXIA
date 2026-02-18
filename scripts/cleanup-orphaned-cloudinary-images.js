const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/uploadProject');
const cloudinary = require('../config/cloudinaryConfig');
require('dotenv').config();

async function cleanupOrphanedImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all valid public_ids from database
    console.log('📊 Collecting valid image IDs from database...');
    
    const users = await User.find({}, 'profilePicture');
    const projects = await Project.find({}, 'thumbnailUrl otherImages');
    
    const validPublicIds = new Set();
    
    // Collect profile picture IDs
    users.forEach(user => {
      if (user.profilePicture?.public_id) {
        validPublicIds.add(user.profilePicture.public_id);
      }
    });
    
    // Collect project image IDs
    projects.forEach(project => {
      if (project.thumbnailUrl?.public_id) {
        validPublicIds.add(project.thumbnailUrl.public_id);
      }
      if (project.otherImages && project.otherImages.length > 0) {
        project.otherImages.forEach(img => {
          if (img.public_id) {
            validPublicIds.add(img.public_id);
          }
        });
      }
    });
    
    console.log(`✅ Found ${validPublicIds.size} valid images in database`);
    console.log(`   - ${users.filter(u => u.profilePicture?.public_id).length} profile pictures`);
    console.log(`   - ${projects.filter(p => p.thumbnailUrl?.public_id).length} project thumbnails`);
    console.log(`   - ${projects.reduce((sum, p) => sum + (p.otherImages?.length || 0), 0)} project images\n`);

    // Get all images from Cloudinary
    console.log('☁️ Fetching all images from Cloudinary...');
    
    let allCloudinaryImages = [];
    let nextCursor = null;
    
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });
      
      allCloudinaryImages = allCloudinaryImages.concat(result.resources);
      nextCursor = result.next_cursor;
      
      console.log(`   Fetched ${allCloudinaryImages.length} images so far...`);
    } while (nextCursor);
    
    console.log(`✅ Found ${allCloudinaryImages.length} total images in Cloudinary\n`);

    // Find orphaned images
    const orphanedImages = allCloudinaryImages.filter(img => !validPublicIds.has(img.public_id));
    
    console.log(`🗑️ Found ${orphanedImages.length} orphaned images to delete\n`);
    
    if (orphanedImages.length === 0) {
      console.log('✅ No orphaned images found. Cloudinary is clean!');
      process.exit(0);
    }

    // Delete orphaned images
    console.log('🗑️ Deleting orphaned images...\n');
    
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const img of orphanedImages) {
      try {
        const result = await cloudinary.uploader.destroy(img.public_id);
        if (result.result === 'ok' || result.result === 'not found') {
          deletedCount++;
          console.log(`   ✅ [${deletedCount}/${orphanedImages.length}] Deleted: ${img.public_id}`);
        } else {
          failedCount++;
          console.log(`   ⚠️ [${deletedCount}/${orphanedImages.length}] Unexpected result for ${img.public_id}: ${result.result}`);
        }
      } catch (err) {
        failedCount++;
        console.error(`   ❌ Failed to delete ${img.public_id}:`, err.message);
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ Cleanup completed!');
    console.log(`   - Successfully deleted: ${deletedCount} images`);
    console.log(`   - Failed: ${failedCount} images`);
    console.log(`   - Total cleaned: ${deletedCount} orphaned images`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupOrphanedImages();
