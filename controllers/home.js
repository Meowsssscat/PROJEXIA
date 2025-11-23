const allProjects = require('../models/uploadProject');
const User = require('../models/User');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');

// --- Helper Functions ---

/**
 * Calculate popularity score (likes + views)
 */
const calculatePopularity = (projectStats, projectId) => {
  const stats = projectStats[projectId] || {};
  return (stats.likeCount || 0) + (stats.viewCount || 0);
};

/**
 * Shuffle array randomly
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Processes user and project data into a consolidated object with stats
 */
const prepareProjectData = (users, projects, projectStats) => {
  const usersObject = {};
  users.forEach(user => {
    usersObject[user._id.toString()] = {
      program: user.program,
      year: user.year
    };
  });

  const data = {};
  projects.forEach(project => {
    const projectId = project._id.toString();
    const userId = project.userId.toString();

    data[projectId] = {
      projectId,
      projectThumbnail: project.thumbnailUrl?.url || '',
      projectName: project.name,
      technologies: project.technologies,
      program: usersObject[userId]?.program || '',
      year: usersObject[userId]?.year || '',
      likeCount: projectStats[projectId]?.likeCount || 0,
      commentCount: projectStats[projectId]?.commentCount || 0,
      viewCount: projectStats[projectId]?.viewCount || 0,
      popularity: calculatePopularity(projectStats, projectId),
      createdAt: project.createdAt
    };
  });

  return data;
};

/**
 * Get top 3 trending projects (EXACTLY 3 projects only)
 */
const getTop3Trending = (projectData) => {
  // Convert to array and sort by popularity
  const projectArray = Object.entries(projectData).map(([id, data]) => ({
    id,
    ...data
  }));

  // Sort by popularity (descending), then by createdAt (newest first) as tiebreaker
  projectArray.sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity;
    }
    // If popularity is the same, use creation date as tiebreaker
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Return EXACTLY top 3 projects
  return projectArray.slice(0, 3);
};

/**
 * Get batchmate projects (same year as current user, excluding top3)
 */
const getBatchmateProjects = (projectData, currentUserYear, excludeIds) => {
  if (!currentUserYear) return [];

  const batchmateProjects = Object.entries(projectData)
    .filter(([id, data]) => {
      // Exclude projects that are already in top 3
      return data.year === currentUserYear && !excludeIds.includes(id);
    })
    .map(([id, data]) => ({ id, ...data }));

  // Sort by popularity (descending)
  batchmateProjects.sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return batchmateProjects;
};

/**
 * Get remaining projects (excluding top 3 and batchmates)
 */
const getRemainingProjects = (projectData, top3Ids, batchmateIds) => {
  const excludedIds = new Set([...top3Ids, ...batchmateIds]);
  
  const remainingProjects = Object.entries(projectData)
    .filter(([id]) => !excludedIds.has(id))
    .map(([id, data]) => ({ id, ...data }));

  // Shuffle for dynamic display
  return shuffleArray(remainingProjects);
};

// ------------------------------------------

// --- Exported Controller Function ---
/**
 * Fetches users and projects, prepares data, and renders the home page with sections.
 */
exports.getHome = async (req, res) => {
  try {
    const currentUserId = req.session?.userId;
    let currentUser = null;

    // Get current user if logged in
    if (currentUserId) {
      currentUser = await User.findById(currentUserId);
    }

    const users = await User.find();
    const projects = await allProjects.find();

    // Fetch counts for all projects
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

    // Prepare all project data
    const allProjectData = prepareProjectData(users, projects, projectStats);

    // Section 1: Top 3 Trending (EXACTLY 3 projects)
    const weeklyTop3 = getTop3Trending(allProjectData);
    const top3Ids = weeklyTop3.map(p => p.id);

    // Section 2: Batchmate Projects (excluding top 3)
    const batchmateProjects = currentUser 
      ? getBatchmateProjects(allProjectData, currentUser.year, top3Ids)
      : [];
    const batchmateIds = batchmateProjects.map(p => p.id);

    // Section 3: Remaining Projects (excluding top 3 and batchmates, shuffled)
    const remainingProjects = getRemainingProjects(allProjectData, top3Ids, batchmateIds);

    console.log("Home page data prepared with sections");
    console.log(`Top 3 Trending: ${top3Ids.length}, Batchmates: ${batchmateIds.length}, Remaining: ${remainingProjects.length}`);

    return res.render('home', { 
      weeklyTop3,
      batchmateProjects,
      remainingProjects,
      currentUser: currentUser ? {
        _id: currentUser._id,
        year: currentUser.year,
        program: currentUser.program
      } : null
    });
  } catch (error) {
    console.error('getHome error', error);
    return res.status(500).json({ message: 'Failed to fetch home data' });
  }
};
