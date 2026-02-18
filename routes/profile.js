const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const checkUser = require('../middleware/checkUser');

// API Routes for profile interactions
// Note: GET /profile and GET /profile/:id are handled in pageRoutes (pageController.getProfilePage)

router.post('/api/profile/:id/view', checkUser, profileController.recordView);

router.post('/api/profile/:id/like', checkUser, profileController.toggleLike);

router.post('/api/profile/:id/comment', checkUser, profileController.addComment);

router.put('/api/profile/:id', checkUser, profileController.updateProject);

module.exports = router;

 