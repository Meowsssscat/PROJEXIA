const User = require('../models/User');
const Project = require('../models/uploadProject');
const Like = require('../models/likes');
const Comment = require('../models/comments');
const View = require('../models/views');

// Helper function to prepare projects data
function prepareProjectsData(users, projects) {
    let usersObject = {};
    users.forEach(user => {
        usersObject[user._id.toString()] = { 
            program: user.program, 
            year: user.year 
        };
    });

    let data = {};
    projects.forEach(project => {
        const projectId = project._id.toString();
        const userId = project.userId?._id?.toString() || project.userId?.toString();
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
            likeCount: project.likes || 0,
            commentCount: project.comments || 0,
            viewCount: project.viewCount || 0
        };
    });

    return data;
}

// GET /auth - Auth page (signin/signup)
exports.getAuthPage = async (req, res) => {
    try {
        const type = req.query.type || 'signin';
        const isLogin = type === 'signin';

        res.render('auth-modern', {
            isLogin,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading auth page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /profile or /profile/:id - User profile page
exports.getProfilePage = async (req, res) => {
    try {
        const userId = req.params.id || req.user?._id;

        if (!userId) {
            return res.redirect('/auth?type=signin');
        }

        // Fetch user profile
        const userProfile = await User.findById(userId).lean();

        if (!userProfile) {
            return res.status(404).render('error', { error: 'User not found' });
        }

        // Fetch user's projects
        const projects = await Project.find({ userId })
            .populate('userId', 'fullName program year')
            .lean();

        // Get liked projects by the user
        const likedProjectIds = await Like.find({ userId: userId }).distinct('projectId');
        const likedProjects = await Project.find({ _id: { $in: likedProjectIds } })
            .populate('userId', 'fullName program year')
            .lean();

        // Enrich projects with stats
        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const likeCount = await Like.countDocuments({ projectId: project._id });
                const commentCount = await Comment.countDocuments({ projectId: project._id });
                const viewCount = await View.countDocuments({ projectId: project._id });

                return {
                    ...project,
                    likes: likeCount,
                    comments: commentCount,
                    viewCount
                };
            })
        );

        // Enrich liked projects with stats
        const enrichedLikedProjects = await Promise.all(
            likedProjects.map(async (project) => {
                const likeCount = await Like.countDocuments({ projectId: project._id });
                const commentCount = await Comment.countDocuments({ projectId: project._id });
                const viewCount = await View.countDocuments({ projectId: project._id });

                return {
                    ...project,
                    likes: likeCount,
                    comments: commentCount,
                    viewCount
                };
            })
        );

        // Prepare liked projects data in the same format as profile.js
        const users = await User.find();
        const likedProjectsData = prepareProjectsData(users, enrichedLikedProjects);

        // Calculate stats
        const totalLikes = enrichedProjects.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComments = enrichedProjects.reduce((sum, p) => sum + (p.comments || 0), 0);
        const totalViews = enrichedProjects.reduce((sum, p) => sum + (p.viewCount || 0), 0);

        const isOwnProfile = req.user && req.user._id.toString() === userId.toString();

        console.log('Rendering profile with likedProjectsData:', Object.keys(likedProjectsData).length, 'projects');

        res.render('profile-modern', {
            userProfile,
            projects: enrichedProjects,
            likedProjectsData: likedProjectsData || {},
            totalLikes,
            totalComments,
            totalViews,
            isOwnProfile,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading profile page:', error);
        console.error('Error stack:', error.stack);
        res.status(500).render('error', { error: 'Failed to load profile' });
    }
};

// GET /editProfile - Edit profile page
exports.getEditProfilePage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth?type=signin');
        }

        const user = await User.findById(req.user._id).lean();

        res.render('edit-profile-modern', {
            user,
            currentUser: user
        });
    } catch (error) {
        console.error('Error loading edit profile page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /upload - Upload project page
exports.getUploadPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth?type=signin');
        }

        res.render('upload-modern', {
            user: req.user
        });
    } catch (error) {
        console.error('Error loading upload page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /settings - Settings page
exports.getSettingsPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth?type=signin');
        }

        const user = await User.findById(req.user._id).lean();

        res.render('settings-modern', {
            user,
            currentUser: user
        });
    } catch (error) {
        console.error('Error loading settings page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /donate - Donation page
exports.getDonatePage = async (req, res) => {
    try {
        res.render('donate-modern', {
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading donate page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /report - Report issue page
exports.getReportPage = async (req, res) => {
    try {
        res.render('report-modern', {
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading report page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};

// GET /forgot-password - Forgot password page
exports.getForgotPasswordPage = async (req, res) => {
    try {
        res.render('forgot-password-modern', {
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading forgot password page:', error);
        res.status(500).render('error', { error: 'Failed to load page' });
    }
};
