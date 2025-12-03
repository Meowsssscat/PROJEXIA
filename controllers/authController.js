const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { fullName, program, year, email, password, track } = req.body;

    // Validate track for 3rd and 4th year students
    if ((year === '3rd' || year === '4th') && !track) {
      return res.status(400).json({ 
        message: 'Track is required for 3rd and 4th year students' 
      });
    }

    // Validate track based on program
    const validTracks = {
      'BSIT': ['WMAD', 'AMG', 'SMP', 'NETA'],
      'BSCS': ['IS', 'GV'],
      'BSIS': []
    };

    if (track && !validTracks[program]?.includes(track)) {
      return res.status(400).json({ 
        message: `${track} is not a valid track for ${program}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'This email is already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.findOneAndDelete({ email });

    // Save OTP to database
    await OTP.create({ 
      email, 
      otp,
      attempts: 0 
    });

    // Create user (unverified)
    await User.create({
      fullName,
      program,
      year,
      email,
      password: hashedPassword,
      track: track || null,
      isVerified: false
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      message: 'Verification code sent to your email',
      email 
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // If email sending fails, clean up created user
    if (error.message.includes('email')) {
      await User.findOneAndDelete({ email: req.body.email, isVerified: false });
      await OTP.findOneAndDelete({ email: req.body.email });
    }
    
    res.status(500).json({ 
      message: error.message || 'Server error. Please try again.' 
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'OTP expired or not found. Please sign up again.',
        expired: true
      });
    }

    // Check if maximum attempts reached
    if (otpRecord.attempts >= 3) {
      // Delete OTP and unverified user
      await OTP.findOneAndDelete({ email });
      await User.findOneAndDelete({ email, isVerified: false });
      
      return res.status(400).json({ 
        message: 'Maximum attempts reached. Please sign up again.',
        redirect: true 
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        message: `Invalid code. ${3 - otpRecord.attempts} attempt(s) remaining.`,
        attemptsRemaining: 3 - otpRecord.attempts
      });
    }

    // OTP is correct - verify user
    const user = await User.findOneAndUpdate(
      { email }, 
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ 
        message: 'User not found. Please sign up again.' 
      });
    }

    // Delete OTP record
    await OTP.findOneAndDelete({ email });

    res.status(200).json({ 
      message: 'Account verified successfully! You can now sign in.'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// @desc    Sign in user
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first. Check your inbox for the verification code.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // **STORE USER IN SESSION - ADD THIS HERE**
    req.session.userId = user._id.toString();

    // Return user data (excluding password) with redirect to home
    res.status(200).json({
      message: 'Sign in successful',
      redirect: '/home',
      user: {
        id: user._id,
        fullName: user.fullName,
        program: user.program,
        year: user.year,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// @desc    Sign out user
// @route   POST /api/auth/signout
// @access  Private
const signout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error signing out' 
        });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ 
        message: 'Signed out successfully' 
      });
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

module.exports = {
  signup,
  verifyOTP,
  signin,
  signout
};