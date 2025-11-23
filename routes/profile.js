const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const checkUser = require('../middleware/checkUser');

router.get('/profile', checkUser, profileController.getProfile);

router.get('/profile/:id', profileController.getProject);

router.post('/api/profile/:id/view', profileController.recordView);

router.post('/api/profile/:id/like', profileController.toggleLike);

router.post('/api/profile/:id/comment', profileController.addComment);

router.put('/api/profile/:id', profileController.updateProject);


module.exports = router;

 