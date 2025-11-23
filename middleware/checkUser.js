// middleware/checkUser.js
const User = require('../models/User');

/**
 * Authentication middleware
 * Checks if user is logged in and session is valid
 */
module.exports = async function (req, res, next) {
  try {
    const userId = req.session?.userId;
    
    // No session - redirect to signin
    if (!userId) {
      // For API routes, return JSON
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized. Please sign in.' 
        });
      }
      return res.redirect('/signin');
    }

    // Verify user still exists in database
    const currentUser = await User.findById(userId).select('-password');
    
    if (!currentUser) {
      // User deleted or invalid - clear session
      req.session.destroy();
      
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
          success: false,
          error: 'User not found. Please sign in again.' 
        });
      }
      return res.redirect('/signin');
    }

    // Attach user to request for use in controllers
    req.user = currentUser;
    next();
    
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ 
        success: false,
        error: 'Authentication error' 
      });
    }
    return res.redirect('/signin');
  }
};
