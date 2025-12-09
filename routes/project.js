const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const checkUser = require('../middleware/checkUser');

// API Routes for project interactions
// Note: GET /project/:id is handled in home.js (browseController.getProjectDetail)

router.post('/api/projects/:id/view', checkUser, projectController.recordView);

router.post('/api/projects/:id/like', checkUser, projectController.toggleLike);

router.post('/api/projects/:id/comment', checkUser, projectController.addComment);

router.delete('/api/projects/:projectId/comment/:commentId', checkUser, projectController.deleteComment);

router.post('/api/projects/:projectId/comment/:commentId/reply', checkUser, projectController.addReply);

router.delete('/api/projects/:projectId/comment/:commentId/reply/:replyId', checkUser, projectController.deleteReply);

router.put('/api/projects/:id', checkUser, projectController.updateProject);

router.delete('/api/projects/:id', checkUser, projectController.deleteProject);

module.exports = router;         