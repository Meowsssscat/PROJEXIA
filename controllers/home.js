const allProjects = require('../models/uploadProject');
const User = require('../models/User');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');

// --- Helper Functions ---

/**
 * Calculate popularity score (likes + views only, no comments to prevent spam)
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

    const thumbnailUrl = project.thumbnailUrl?.url || '/uploads/default-thumbnail.jpg';
    
    data[projectId] = {
      projectId,
      projectThumbnail: thumbnailUrl,
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
    
    // Debug log
    if (!project.thumbnailUrl?.url) {
      console.log(`⚠️ Project "${project.name}" has no thumbnail URL`);
    }
  });

  return data;
};

/**
 * Get top 10 trending projects for carousel
 */
const getTop10Trending = (projectData) => {
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

  // Return top 10 projects
  return projectArray.slice(0, 10);
};

/**
 * Get batchmate projects (same year as current user, excluding top 10)
 * Returns in random order
 */
const getBatchmateProjects = (projectData, currentUserYear, excludeIds) => {
  if (!currentUserYear) return [];

  const batchmateProjects = Object.entries(projectData)
    .filter(([id, data]) => {
      // Exclude projects that are already in top 10
      return data.year === currentUserYear && !excludeIds.includes(id);
    })
    .map(([id, data]) => ({ id, ...data }));

  // Shuffle randomly
  return shuffleArray(batchmateProjects);
};

/**
 * Get remaining projects (excluding top 10 and batchmates)
 * Returns in random order
 */
const getRemainingProjects = (projectData, top10Ids, batchmateIds) => {
  const excludedIds = new Set([...top10Ids, ...batchmateIds]);
  
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
    const { search = '', program = '', yearLevel = '', track = '' } = req.query;
    
    // Handle multiple language parameters
    let languages = req.query.language;
    if (languages && !Array.isArray(languages)) {
      languages = [languages];
    }
    
    const currentUserId = req.session?.userId;
    let currentUser = null;

    // Get current user if logged in
    if (currentUserId) {
      currentUser = await User.findById(currentUserId);
    }

    // Build filters
    let projectFilter = {};
    let userFilter = {};

    // Search filter
    if (search) {
      projectFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    // Technology filter
    if (languages && languages.length > 0) {
      projectFilter.technologies = { $in: languages };
    }

    // User filters (program, year, track)
    if (program) {
      userFilter.program = program;
    }
    if (yearLevel) {
      const yearMap = {
        '1': '1st',
        '2': '2nd',
        '3': '3rd',
        '4': '4th'
      };
      userFilter.year = yearMap[yearLevel] || yearLevel;
    }
    if (track) {
      userFilter.track = track;
    }

    // Get users (filtered if needed)
    const users = Object.keys(userFilter).length > 0 
      ? await User.find(userFilter)
      : await User.find();
    
    // If user filter is applied but no users match, return empty
    if (Object.keys(userFilter).length > 0 && users.length === 0) {
      return res.render('home-modern', { 
        top10Trending: [],
        batchmateProjects: [],
        remainingProjects: [],
        currentUser: currentUser ? {
          _id: currentUser._id,
          year: currentUser.year,
          program: currentUser.program
        } : null,
        user: currentUser,
        searchTerm: search,
        selectedProgram: program,
        selectedYear: yearLevel,
        selectedLanguages: languages || [],
        selectedTrack: track,
        availableTechnologies: []
      });
    }

    // Filter projects by user IDs if user filter is applied
    if (Object.keys(userFilter).length > 0) {
      const userIds = users.map(u => u._id);
      projectFilter.userId = { $in: userIds };
    }

    const projects = await allProjects.find(projectFilter);

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

    // Section 1: Top 10 Trending (for carousel)
    const top10Trending = getTop10Trending(allProjectData);
    const top10Ids = top10Trending.map(p => p.id);

    // Section 2: Batchmate Projects (excluding top 10, random order)
    const batchmateProjects = currentUser 
      ? getBatchmateProjects(allProjectData, currentUser.year, top10Ids)
      : [];
    const batchmateIds = batchmateProjects.map(p => p.id);

    // Section 3: Remaining Projects (excluding top 10 and batchmates, random order)
    const remainingProjects = getRemainingProjects(allProjectData, top10Ids, batchmateIds);

    console.log("Home page data prepared with sections");
    console.log(`Top 10 Trending: ${top10Ids.length}, Batchmates: ${batchmateIds.length}, Remaining: ${remainingProjects.length}`);

    // Get all unique technologies from all projects for filter dropdown
    const allProjectsForTech = await allProjects.find().select('technologies').lean();
    const allTechnologies = new Set();
    allProjectsForTech.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => {
          if (tech && tech.trim()) {
            allTechnologies.add(tech.trim());
          }
        });
      }
    });
    const availableTechnologies = Array.from(allTechnologies).sort();

    return res.render('home-modern', { 
      top10Trending,
      batchmateProjects,
      remainingProjects,
      currentUser: currentUser ? {
        _id: currentUser._id,
        year: currentUser.year,
        program: currentUser.program
      } : null,
      user: currentUser, // Add user for navbar compatibility
      searchTerm: search,
      selectedProgram: program,
      selectedYear: yearLevel,
      selectedLanguages: languages || [],
      selectedTrack: track,
      availableTechnologies: availableTechnologies
    });
  } catch (error) {
    console.error('getHome error', error);
    return res.status(500).json({ message: 'Failed to fetch home data' });
  }
};
