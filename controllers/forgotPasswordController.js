const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { generateOTP, sendPasswordResetEmail } = require('../services/emailService');

// ===============================
// REQUEST PASSWORD RESET
// ===============================
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset code.' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        error: 'Please verify your email first before resetting password.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing password reset request for this email
    await PasswordReset.findOneAndDelete({ email });

    // Save new password reset request
    await PasswordReset.create({
      email,
      otp,
      attempts: 0
    });

    // Send password reset email
    await sendPasswordResetEmail(email, otp);

    res.status(200).json({ 
      message: 'Password reset code sent to your email',
      email 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send password reset code. Please try again.' 
    });
  }
};

// ===============================
// VERIFY RESET CODE
// ===============================
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find password reset record
    const resetRecord = await PasswordReset.findOne({ email });

    if (!resetRecord) {
      return res.status(400).json({ 
        error: 'Reset code expired or not found. Please request a new code.',
        expired: true
      });
    }

    // Check if maximum attempts reached
    if (resetRecord.attempts >= 3) {
      await PasswordReset.findOneAndDelete({ email });
      return res.status(400).json({ 
        error: 'Maximum attempts reached. Please request a new code.',
        maxAttempts: true 
      });
    }

    // Verify OTP
    if (resetRecord.otp !== otp) {
      resetRecord.attempts += 1;
      await resetRecord.save();
      
      return res.status(400).json({ 
        error: `Invalid code. ${3 - resetRecord.attempts} attempt(s) remaining.`,
        attemptsRemaining: 3 - resetRecord.attempts
      });
    }

    // OTP is correct
    res.status(200).json({ 
      message: 'Code verified successfully. You can now reset your password.',
      verified: true
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Server error. Please try again.' 
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Find password reset record
    const resetRecord = await PasswordReset.findOne({ email });

    if (!resetRecord) {
      return res.status(400).json({ 
        error: 'Reset code expired. Please request a new code.',
        expired: true
      });
    }

    // Verify OTP one more time
    if (resetRecord.otp !== otp) {
      return res.status(400).json({ 
        error: 'Invalid code. Please try again.' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete password reset record
    await PasswordReset.findOneAndDelete({ email });

    res.status(200).json({ 
      message: 'Password reset successfully! You can now sign in with your new password.',
      success: true
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password. Please try again.' 
    });
  }
};

// ===============================
// CHANGE PASSWORD (From Settings)
// ===============================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
      return res.status(400).json({ 
        error: 'New password must be different from current password' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ 
      message: 'Password changed successfully!',
      success: true
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password. Please try again.' 
    });
  }
};
