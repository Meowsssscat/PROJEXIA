const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
issueReportSchema.index({ userId: 1, createdAt: -1 });
issueReportSchema.index({ status: 1 });

module.exports = mongoose.model('IssueReport', issueReportSchema);
