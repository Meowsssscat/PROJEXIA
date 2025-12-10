const User = require('../models/User');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');

exports.updateProfile = async (req, res) => {
  const userId = req.session.userId; // or however you store session user
  const { fullName, program, year, track, bio, github, portfolio, linkedin, deleteAvatar } = req.body;

  console.log('📝 Edit Profile Request:');
  console.log('User ID:', userId);
  console.log('Has file:', !!req.file);
  console.log('File details:', req.file);
  console.log('Delete avatar VALUE:', deleteAvatar);
  console.log('Delete avatar TYPE:', typeof deleteAvatar);
  console.log('Delete avatar === "true":', deleteAvatar === 'true');
  console.log('Full Body:', JSON.stringify(req.body, null, 2));

  try {
    const user = await User.findById(userId);

    // 🚫 Check if user already edited within 30 days (DISABLED FOR TESTING)
    // if (user.lastProfileEdit) {
    //   const now = new Date();
    //   const nextAllowedEdit = new Date(user.lastProfileEdit);
    //   nextAllowedEdit.setMonth(nextAllowedEdit.getMonth() + 1);

    //   if (now < nextAllowedEdit) {
    //     const daysLeft = Math.ceil((nextAllowedEdit - now) / (1000 * 60 * 60 * 24));
    //     return res.status(400).json({ 
    //       success: false,
    //       message: `You can only edit your profile once per month. Please wait ${daysLeft} more days.` 
    //     });
    //   }
    // }

    // Validate track for 3rd and 4th year students
    if ((year === '3rd' || year === '4th') && !track) {
      return res.status(400).json({ 
        success: false,
        message: 'Track is required for 3rd and 4th year students' 
      });
    }

    // Validate track based on program
    const validTracks = {
      'BSIT': ['WMAD', 'AMG', 'SMP', 'NETAD'],
      'BSCS': ['IS', 'GV'],
      'BSIS': []
    };

    if (track && !validTracks[program]?.includes(track)) {
      return res.status(400).json({ 
        success: false,
        message: `${track} is not a valid track for ${program}` 
      });
    }

    // ✔ Handle profile picture upload (takes priority over deletion)
    if (req.file) {
      try {
        // Delete old profile picture from Cloudinary if exists
        if (user.profilePicture?.public_id) {
          await cloudinary.uploader.destroy(user.profilePicture.public_id);
        }

        // Upload new profile picture to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: `users/${userId}/profile`,
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }
          ]
        });

        user.profilePicture = {
          url: result.secure_url,
          public_id: result.public_id
        };

        // Clean up temp file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Profile picture upload error:', uploadError);
        // Clean up temp file
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        // Continue with profile update even if image upload fails
      }
    }
    // ✔ Handle profile picture deletion (only if no new file uploaded)
    else if (deleteAvatar === 'true') {
      try {
        console.log('🗑️ Attempting to delete profile picture...');
        console.log('Current profile picture:', user.profilePicture);
        
        // Delete profile picture from Cloudinary if exists
        if (user.profilePicture?.public_id) {
          const deleteResult = await cloudinary.uploader.destroy(user.profilePicture.public_id);
          console.log('✅ Cloudinary deletion result:', deleteResult);
          
          if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
            console.log('✅ Profile picture deleted from Cloudinary successfully');
          } else {
            console.warn('⚠️ Unexpected Cloudinary deletion result:', deleteResult);
          }
        } else {
          console.log('ℹ️ No profile picture public_id found, skipping Cloudinary deletion');
        }
        
        // Remove profile picture from user (set to undefined to completely remove it)
        user.profilePicture = undefined;
        // Or explicitly set both fields to empty
        user.set('profilePicture.url', '');
        user.set('profilePicture.public_id', '');
        console.log('✅ Profile picture removed from user document');
      } catch (deleteError) {
        console.error('❌ Profile picture deletion error:', deleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete profile picture: ' + deleteError.message
        });
      }
    }

    // ✔ Update user info
    user.fullName = fullName;
    user.program = program;
    user.year = year;
    user.track = track || null;
    user.bio = bio ? bio.trim().substring(0, 160) : ''; // Limit to 160 chars
    user.github = github ? github.trim() : '';
    user.portfolio = portfolio ? portfolio.trim() : '';
    user.linkedin = linkedin ? linkedin.trim() : '';
    user.lastProfileEdit = new Date();

    await user.save();

    console.log('✅ Profile updated successfully');
    console.log('Profile picture URL:', user.profilePicture?.url);

    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profilePicture: user.profilePicture 
    });

  } catch (err) {
    console.error('❌ Edit Profile Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong."
    });
  }
};
