const Project = require('../models/uploadProject');
const User = require('../models/User');
const Like = require('../models/likes');
const Comment = require('../models/comments');
const View = require('../models/views');

// GET /browse - Browse all projects
exports.getBrowseProjects = async (req, res) => {
    try {
        const { search = '', program = '', yearLevel = '', track = '', sort = 'trending' } = req.query;
        
        // Handle multiple language parameters
        let languages = req.query.language;
        if (languages && !Array.isArray(languages)) {
            languages = [languages];
        }
        
        let projectFilter = {};
        let userFilter = {};

        // Build search filter for projects (search in name, description, and technologies)
        if (search) {
            projectFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { technologies: { $regex: search, $options: 'i' } }
            ];
        }

        // Build user filter for program, year, and track (these are on User, not Project)
        if (program) {
            userFilter.program = program;
        }
        if (yearLevel) {
            // Year is stored as '1st', '2nd', '3rd', '4th' in the database
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

        // Add technology filter (technologies is on Project) - support multiple
        // Projects must have AT LEAST ONE of the selected technologies (OR logic)
        if (languages && languages.length > 0) {
            projectFilter.technologies = { $in: languages };
        }

        // First, find users matching the criteria
        let userIds = null;
        if (Object.keys(userFilter).length > 0) {
            const users = await User.find(userFilter).select('_id');
            userIds = users.map(u => u._id);
            
            // Only filter by userId if we found matching users
            if (userIds.length > 0) {
                projectFilter.userId = { $in: userIds };
            } else {
                // No users match the criteria, return empty results
                return res.render('browse-modern', {
                    projects: [],
                    user: req.user || null,
                    searchTerm: search,
                    selectedProgram: program,
                    selectedYear: yearLevel,
                    selectedLanguages: languages || [],
                    selectedTrack: track,
                    selectedSort: sort,
                    availableTechnologies: []
                });
            }
        }

        // Fetch all projects
        let projects = await Project.find(projectFilter)
            .populate('userId', 'fullName program year track')
            .lean();

        // Enrich projects with stats first (needed for sorting)
        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const likeCount = await Like.countDocuments({ projectId: project._id });
                
                // Get comments with replies to count total
                const projectComments = await Comment.find({ projectId: project._id }).lean();
                const commentCount = projectComments.reduce((total, comment) => {
                    return total + 1 + (comment.replies?.length || 0);
                }, 0);
                
                const viewCount = await View.countDocuments({ projectId: project._id });
                
                // Calculate popularity score
                const popularity = likeCount + viewCount;

                return {
                    ...project,
                    userId: project.userId || {},
                    likes: likeCount,
                    comments: commentCount,
                    viewCount: viewCount,
                    popularity: popularity
                };
            })
        );

        // Apply sorting based on sort parameter
        switch (sort) {
            case 'newest':
                enrichedProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'likes':
                enrichedProjects.sort((a, b) => b.likes - a.likes);
                break;
            case 'views':
                enrichedProjects.sort((a, b) => b.viewCount - a.viewCount);
                break;
            case 'random':
                // Fisher-Yates shuffle
                for (let i = enrichedProjects.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [enrichedProjects[i], enrichedProjects[j]] = [enrichedProjects[j], enrichedProjects[i]];
                }
                break;
            case 'trending':
            default:
                // Sort by popularity (likes + views), then by newest as tiebreaker
                enrichedProjects.sort((a, b) => {
                    if (b.popularity !== a.popularity) {
                        return b.popularity - a.popularity;
                    }
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                break;
        }

        // Get all unique technologies from all projects
        const allProjects = await Project.find().select('technologies').lean();
        const allTechnologies = new Set();
        allProjects.forEach(project => {
            if (project.technologies && Array.isArray(project.technologies)) {
                project.technologies.forEach(tech => {
                    if (tech && tech.trim()) {
                        allTechnologies.add(tech.trim());
                    }
                });
            }
        });
        
        // Convert Set to sorted array
        const availableTechnologies = Array.from(allTechnologies).sort();

        res.render('browse-modern', {
            projects: enrichedProjects,
            user: req.user || null,
            searchTerm: search,
            selectedProgram: program,
            selectedYear: yearLevel,
            selectedLanguages: languages || [],
            selectedTrack: track,
            selectedSort: sort,
            availableTechnologies: availableTechnologies
        });
    } catch (error) {
        console.error('Error loading browse page:', error);
        res.status(500).render('error', { error: 'Failed to load projects' });
    }
};

// GET /project/:id - Project detail page
exports.getProjectDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch project
        const project = await Project.findById(id)
            .populate('userId')
            .lean();

        if (!project) {
            return res.status(404).render('error', { error: 'Project not found' });
        }

        // Fetch stats
        const likeCount = await Like.countDocuments({ projectId: id });
        const comments = await Comment.find({ projectId: id })
            .populate('userId')
            .populate('replies.userId')
            .sort({ createdAt: -1 })
            .lean();
        
        // Calculate total comment count including replies
        const commentCount = comments.reduce((total, comment) => {
            return total + 1 + (comment.replies?.length || 0);
        }, 0);
        
        const viewCount = await View.countDocuments({ projectId: id });

        // Check if current user liked this project
        let isLiked = false;
        if (req.user) {
            const userLike = await Like.findOne({ projectId: id, userId: req.user._id });
            isLiked = !!userLike;
        }

        // Increment view count - only if user is logged in
        if (req.user && req.user._id.toString() !== project.userId._id.toString()) {
            const existingView = await View.findOne({ projectId: id, userId: req.user._id });
            if (!existingView) {
                try {
                    await View.create({ projectId: id, userId: req.user._id });
                } catch (viewError) {
                    // Silently fail if view creation fails
                    console.warn('Failed to create view record:', viewError.message);
                }
            }
        }

        res.render('project-detail-modern', {
            project: project,
            comments,
            commentCount: commentCount,
            likeCount: likeCount,
            viewCount: viewCount,
            hasLiked: isLiked,
            isLiked: isLiked,
            user: req.user || null,
            userId: project.userId?._id,
            uploader: project.userId,
            isUploader: req.user && req.user._id.toString() === project.userId._id.toString(),
            currentUserId: req.user?._id || null
        });
    } catch (error) {
        console.error('Error loading project detail:', error);
        res.status(500).render('error', { error: 'Failed to load project' });
    }
};
