const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/checkUser');
const Like = require('../models/likes');
const Project = require('../models/uploadProject');
const User = require('../models/User');

// GET /api/liked-projects - Get user's liked projects
router.get('/api/liked-projects', checkUser, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all likes by this user
    const likes = await Like.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get project IDs
    const projectIds = likes.map(like => like.projectId);

    // Fetch projects with uploader info
    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate('userId', 'fullName')
      .lean();

    // Map projects with uploader names
    const projectsWithUploaders = projects.map(project => ({
      ...project,
      uploaderName: project.userId?.fullName || 'Anonymous'
    }));

    res.json({
      success: true,
      projects: projectsWithUploaders
    });

  } catch (error) {
    console.error('Error fetching liked projects:', error);
    res.status(500).json({ error: 'Failed to fetch liked projects' });
  }
});

module.exports = router;
