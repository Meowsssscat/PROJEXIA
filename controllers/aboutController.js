const User = require('../models/User');

// GET /about - About page (accessible to everyone)
exports.getAboutPage = async (req, res) => {
    try {
        // Use req.user from optionalAuth middleware
        const currentUser = req.user || null;

        res.render('about-modern', {
            user: currentUser,
            currentUser
        });
    } catch (error) {
        console.error('Error loading about page:', error);
        res.status(500).send('Server error');
    }
};
