const User = require('../models/User');

// GET /about - About page
exports.getAboutPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/signin');
        }

        const currentUser = await User.findById(userId).select('-password');
        
        if (!currentUser) {
            req.session.destroy();
            return res.redirect('/signin');
        }

        res.render('about', {
            currentUser
        });
    } catch (error) {
        console.error('Error loading about page:', error);
        res.status(500).send('Server error');
    }
};
