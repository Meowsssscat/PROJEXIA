// middleware/optionalAuth.js
const User = require('../models/User');

/**
 * Optional authentication middleware
 * Sets req.user if logged in, but doesn't require authentication
 * Allows both authenticated and guest users to access the route
 */
module.exports = async function (req, res, next) {
  try {
    const userId = req.session?.userId;
    
    // No session - continue as guest
    if (!userId) {
      req.user = null;
      return next();
    }

    // Verify user still exists in database
    const currentUser = await User.findById(userId).select('-password');
    
    if (!currentUser) {
      // User deleted or invalid - clear session and continue as guest
      req.session.destroy();
      req.user = null;
      return next();
    }

    // Attach user to request for use in controllers
    req.user = currentUser;
    next();
    
  } catch (err) {
    console.error('Optional auth middleware error:', err);
    // On error, continue as guest
    req.user = null;
    next();
  }
};
