// Authentication Middleware

/**
 * Check if user is authenticated
 * Redirects to signin if not authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // If it's an API request, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
            success: false,
            error: 'Unauthorized. Please sign in.' 
        });
    }
    
    // For page requests, redirect to signin
    return res.redirect('/signin');
};

/**
 * Check if user is NOT authenticated (for signin/signup pages)
 * Redirects to home if already authenticated
 */
const isNotAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/home');
    }
    return next();
};

/**
 * Optional authentication - doesn't block, just adds user info if available
 */
const optionalAuth = (req, res, next) => {
    // Just pass through, controllers can check req.session.userId
    next();
};

module.exports = {
    isAuthenticated,
    isNotAuthenticated,
    optionalAuth
};
