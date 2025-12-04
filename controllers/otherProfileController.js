const Project = require('../models/uploadProject');
const User = require('../models/User');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.session?.userId;
    
    // Check if the user is trying to view their own profile
    if (currentUserId && currentUserId.toString() === userId.toString()) {
      // Redirect to their own profile page
      return res.redirect('/profile');
    }
    
    const userToVisit = await User.findById(userId);
    
    if (!userToVisit) {
      return res.status(404).send('User not found');
    }
    
    const users = await User.find();
    
    const projects = await Project.find({ userId: userId });

    // Fetch counts for user's projects
    const projectIds = projects.map(p => p._id);
    
    // Get counts using aggregation for better performance
    const [likeCounts, commentCounts, viewCounts] = await Promise.all([
      Like.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } }
      ]),
      Comment.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } }
      ]),
      View.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } }
      ])
    ]);

    // Create a stats object indexed by projectId
    const projectStats = {};
    likeCounts.forEach(item => {
      const id = item._id.toString();
      if (!projectStats[id]) projectStats[id] = {};
      projectStats[id].likeCount = item.count;
    });
    commentCounts.forEach(item => {
      const id = item._id.toString();
      if (!projectStats[id]) projectStats[id] = {};
      projectStats[id].commentCount = item.count;
    });
    viewCounts.forEach(item => {
      const id = item._id.toString();
      if (!projectStats[id]) projectStats[id] = {};
      projectStats[id].viewCount = item.count;
    });

    const data = this.prepareData(users, projects, projectStats);

    // Get current logged-in user for navbar
    let currentUser = null;
    if (currentUserId) {
      currentUser = await User.findById(currentUserId);
    }

    console.log(data)
    console.log(userToVisit)
    return res.render('otherProfile-modern', { 
    data,
    user: currentUser, // Pass current logged-in user for navbar
    userToVisit: {
        fullName: userToVisit.fullName,
        program: userToVisit.program,
        year: userToVisit.year,
        track: userToVisit.track,
        bio: userToVisit.bio,
        profilePicture: userToVisit.profilePicture,
        github: userToVisit.github,
        portfolio: userToVisit.portfolio,
        linkedin: userToVisit.linkedin,
        email: userToVisit.email,
        lastProfileEdit: userToVisit.lastProfileEdit  
    }
    });

  } catch (error) {
    console.error('getProfile error', error);
    return res.status(500).send('Error loading profile');
  }
};


exports.prepareData = (users, projects, projectStats) => {
  let usersObject = {};
  users.forEach(user => {
    usersObject[user._id.toString()] = { program: user.program, year: user.year };
  });

  let data = {};
  projects.forEach(project => {
    const projectId = project._id.toString();
    const userId = project.userId.toString();
    const projectName = project.name;
    const projectThumbnail = project.thumbnailUrl?.url || '';
    const technologies = project.technologies;

    data[projectId] = {
      projectId,
      projectThumbnail,
      projectName,
      technologies,
      program: usersObject[userId]?.program || '',
      year: usersObject[userId]?.year || '',
      likeCount: projectStats[projectId]?.likeCount || 0,
      commentCount: projectStats[projectId]?.commentCount || 0,
      viewCount: projectStats[projectId]?.viewCount || 0
    };
  }); 

  return data;
};


