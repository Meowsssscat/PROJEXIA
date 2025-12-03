const Project = require('../models/uploadProject');
const User = require('../models/User');
const Like = require('../models/likes');
const Comment = require('../models/comments');
const View = require('../models/views');

// GET /browse - Browse all projects
exports.getBrowseProjects = async (req, res) => {
    try {
        const { search = '', program = '', yearLevel = '', language = '' } = req.query;
        let filter = {};
        let userFilter = {};

        // Build search filter for projects
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build user filter for program and year (these are on User, not Project)
        if (program) {
            userFilter.program = program;
        }
        if (yearLevel) {
            userFilter.year = parseInt(yearLevel);
        }

        // Add language filter (technologies is on Project)
        if (language) {
            filter.technologies = { $in: [language] };
        }

        // First, find users matching the criteria
        let userIds = null;
        if (Object.keys(userFilter).length > 0) {
            const users = await User.find(userFilter).select('_id');
            userIds = users.map(u => u._id);
            filter.userId = { $in: userIds };
        }

        // Fetch projects
        const projects = await Project.find(filter)
            .populate('userId', 'fullName program year')
            .sort({ createdAt: -1 })
            .lean();

        // Enrich projects with stats
        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const likeCount = await Like.countDocuments({ projectId: project._id });
                const commentCount = await Comment.countDocuments({ projectId: project._id });
                const viewCount = await View.countDocuments({ projectId: project._id });

                return {
                    ...project,
                    userId: project.userId || {},
                    likes: likeCount,
                    comments: commentCount,
                    viewCount: viewCount
                };
            })
        );

        // Debug: Log first project's thumbnail
        if (enrichedProjects.length > 0) {
            console.log('First project thumbnail:', enrichedProjects[0].thumbnailUrl);
        }

        res.render('browse-modern', {
            projects: enrichedProjects,
            user: req.user || null,
            searchTerm: search,
            selectedProgram: program,
            selectedYear: yearLevel,
            selectedLanguage: language
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
            .populate('userId', 'fullName program year')
            .lean();

        if (!project) {
            return res.status(404).render('error', { error: 'Project not found' });
        }

        // Fetch stats
        const likeCount = await Like.countDocuments({ projectId: id });
        const comments = await Comment.find({ projectId: id })
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .lean();
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
            project: {
                ...project,
                likes: likeCount,
                comments: comments.length,
                viewCount: viewCount
            },
            comments,
            isLiked,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading project detail:', error);
        res.status(500).render('error', { error: 'Failed to load project' });
    }
};
