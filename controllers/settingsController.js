const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/uploadProject');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinaryConfig');

// ===============================
// GET SETTINGS PAGE
// ===============================
exports.getSettings = async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.redirect('/signin');
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.redirect('/signin');
    }

    return res.render('settings-modern', {
      currentUser: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        program: user.program,
        year: user.year,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error loading settings:', error);
    return res.status(500).json({ message: 'Failed to load settings' });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
};

// ===============================
// DELETE ACCOUNT
// ===============================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Verify user and password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Get all user's projects
    const projects = await Project.find({ userId });

    // Delete all project images from Cloudinary
    for (const project of projects) {
      // Delete thumbnail
      if (project.thumbnailUrl?.public_id) {
        try {
          await cloudinary.uploader.destroy(project.thumbnailUrl.public_id);
        } catch (err) {
          console.error('Error deleting thumbnail:', err);
        }
      }

      // Delete other images
      if (project.otherImages && project.otherImages.length > 0) {
        for (const img of project.otherImages) {
          if (img.public_id) {
            try {
              await cloudinary.uploader.destroy(img.public_id);
            } catch (err) {
              console.error('Error deleting image:', err);
            }
          }
        }
      }
    }

    const projectIds = projects.map(p => p._id);

    // Delete all related data
    await Promise.all([
      // Delete user's projects
      Project.deleteMany({ userId }),
      
      // Delete user's comments
      Comment.deleteMany({ userId }),
      
      // Delete user's likes
      Like.deleteMany({ userId }),
      
      // Delete user's views
      View.deleteMany({ userId }),
      
      // Delete comments on user's projects
      Comment.deleteMany({ projectId: { $in: projectIds } }),
      
      // Delete likes on user's projects
      Like.deleteMany({ projectId: { $in: projectIds } }),
      
      // Delete views on user's projects
      View.deleteMany({ projectId: { $in: projectIds } }),
      
      // Delete notifications sent to user
      Notification.deleteMany({ recipientId: userId }),
      
      // Delete notifications sent by user
      Notification.deleteMany({ senderId: userId }),
      
      // Finally, delete the user
      User.findByIdAndDelete(userId)
    ]);

    // Destroy session
    req.session.destroy();

    return res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
};

// ===============================
// SIGN OUT
// ===============================
exports.signOut = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to sign out' });
      }
      return res.json({ success: true });
    });
  } catch (error) {
    console.error('Error signing out:', error);
    return res.status(500).json({ error: 'Failed to sign out' });
  }
};
