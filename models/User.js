const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: {
      values: ['BSIT', 'BSIS', 'BSCS'],
      message: '{VALUE} is not a valid program'
    }
  },
  year: {
    type: String,
    required: [true, 'Year level is required'],
    enum: {
      values: ['1st', '2nd', '3rd', '4th'],
      message: '{VALUE} is not a valid year level'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/@lspu\.edu\.ph$/, 'Please use your LSPU institutional email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // ⭐ NEW FIELD: Tracks last time user updated profile
  lastProfileEdit: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
