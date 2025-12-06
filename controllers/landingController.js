const Project = require('../models/uploadProject');

// GET / - Landing page
exports.getLandingPage = async (req, res) => {
    try {
        // If user is logged in, redirect to browse page
        if (req.session?.userId || req.user) {
            return res.redirect('/browse');
        }

        // Get top 6 projects by popularity (likes + views + comments)
        const projects = await Project.find()
            .populate('userId', 'fullName program year')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Filter out projects without valid users
        const validProjects = projects.filter(project => project.userId);

        // Calculate popularity score for each project
        const projectsWithPopularity = await Promise.all(
            validProjects.map(async (project) => {
                const Like = require('../models/likes');
                const Comment = require('../models/comments');
                const View = require('../models/views');

                const likeCount = await Like.countDocuments({ projectId: project._id });
                const commentCount = await Comment.countDocuments({ projectId: project._id });
                const viewCount = await View.countDocuments({ projectId: project._id });

                // Popularity formula: likes * 3 + comments * 2 + views
                const popularity = (likeCount * 3) + (commentCount * 2) + viewCount;

                return {
                    ...project,
                    likeCount,
                    commentCount,
                    viewCount,
                    popularity
                };
            })
        );

        // Sort by popularity and get top 6
        const topProjects = projectsWithPopularity
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6);

        res.render('landing-modern', {
            topProjects,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading landing page:', error);
        res.status(500).send('Server error');
    }
};
