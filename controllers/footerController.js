const User = require('../models/User');
const Project = require('../models/uploadProject');
const Rating = require('../models/Rating');
const IssueReport = require('../models/IssueReport');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================
// GET STATISTICS
// ===============================
exports.getStatistics = async (req, res) => {
  try {
    const [userCount, projectCount] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Project.countDocuments()
    ]);

    res.json({
      userCount,
      projectCount
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// ===============================
// GET AVERAGE RATING
// ===============================
exports.getAverageRating = async (req, res) => {
  try {
    const ratings = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (ratings.length === 0) {
      return res.json({
        averageRating: 0,
        totalRatings: 0
      });
    }

    res.json({
      averageRating: Math.round(ratings[0].averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: ratings[0].totalRatings
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

// ===============================
// SUBMIT RATING
// ===============================
exports.submitRating = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { rating } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Please sign in to rate' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already rated
    const existingRating = await Rating.findOne({ userId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.updatedAt = Date.now();
      await existingRating.save();

      return res.json({
        message: 'Rating updated successfully!',
        rating: existingRating
      });
    } else {
      // Create new rating
      const newRating = await Rating.create({
        userId,
        rating
      });

      return res.json({
        message: 'Thank you for rating!',
        rating: newRating
      });
    }

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// ===============================
// GET USER'S RATING
// ===============================
exports.getUserRating = async (req, res) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.json({ rating: null });
    }

    const userRating = await Rating.findOne({ userId });

    res.json({
      rating: userRating ? userRating.rating : null
    });

  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ error: 'Failed to fetch user rating' });
  }
};

// ===============================
// SUBMIT RATING WITH COMMENTS
// ===============================
exports.submitRatingWithComments = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { rating, comments } = req.body;

    // Allow submission even without auth (optional login)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!comments || comments.trim().length === 0) {
      return res.status(400).json({ error: 'Comments are required' });
    }

    // Create rating with comments
    const newRating = await Rating.create({
      userId: userId || null,
      rating,
      comments: comments.trim(),
      isPublic: true
    });

    res.json({
      message: 'Thank you for your feedback!',
      success: true,
      rating: newRating
    });

  } catch (error) {
    console.error('Error submitting rating with comments:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// ===============================
// SUBMIT ISSUE REPORT
// ===============================
exports.submitIssueReport = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { subject, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Please sign in to report an issue' });
    }

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    // Get user info
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save issue report to database
    const issueReport = await IssueReport.create({
      userId,
      email: user.email,
      subject: subject.trim(),
      description: description.trim()
    });

    // Send email to Projexia team
    const adminMailOptions = {
      from: {
        name: 'PROJEXIA Issue Reporter',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER, // Send to Projexia email
      subject: `[ISSUE REPORT] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #c9362e 0%, #cf3734 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #c9362e; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 New Issue Report</h1>
              <p style="margin: 10px 0 0 0;">PROJEXIA Platform</p>
            </div>
            <div class="content">
              <h2 style="color: #c9362e;">Issue Details</h2>
              
              <div class="info-box">
                <strong>Reporter:</strong> ${user.fullName}<br>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Program:</strong> ${user.program} - ${user.year} Year<br>
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </div>
              
              <div class="info-box">
                <strong>Subject:</strong><br>
                ${subject}
              </div>
              
              <div class="info-box">
                <strong>Description:</strong><br>
                ${description.replace(/\n/g, '<br>')}
              </div>
              
              <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Action Required:</strong> Please respond to this issue by replying to <strong>${user.email}</strong>
              </p>
            </div>
            <div class="footer">
              <p>PROJEXIA - Project Showcase Platform</p>
              <p>&copy; ${new Date().getFullYear()} LSPU College of Computer Studies</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: {
        name: 'PROJEXIA Support',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: 'Issue Report Received - PROJEXIA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✓ Report Received</h1>
              <p style="margin: 10px 0 0 0;">PROJEXIA Support Team</p>
            </div>
            <div class="content">
              <div class="success-box">
                <strong>✓ Your issue report has been successfully submitted!</strong>
              </div>
              
              <p>Dear ${user.fullName},</p>
              
              <p>Thank you for taking the time to report an issue. We have received your report and our team will review it as soon as possible.</p>
              
              <div class="info-box">
                <strong>Report Summary:</strong><br><br>
                <strong>Subject:</strong> ${subject}<br>
                <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
                <strong>Status:</strong> Pending Review
              </div>
              
              <p>We appreciate your feedback and will respond to your email (<strong>${user.email}</strong>) within 24-48 hours.</p>
              
              <p>If you have any additional information to add, please reply to this email.</p>
              
              <p>Best regards,<br>
              <strong>PROJEXIA Support Team</strong><br>
              College of Computer Studies</p>
            </div>
            <div class="footer">
              <p>PROJEXIA - Project Showcase Platform</p>
              <p>&copy; ${new Date().getFullYear()} LSPU College of Computer Studies</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    res.json({
      message: 'Issue report submitted successfully! Check your email for confirmation.',
      success: true
    });

  } catch (error) {
    console.error('Error submitting issue report:', error);
    res.status(500).json({ error: 'Failed to submit issue report' });
  }
};
