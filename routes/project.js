const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const checkUser = require('../middleware/checkUser');

router.get('/project/:id', checkUser, projectController.getProject);

router.get('/project/:id', projectController.getProject);

router.post('/api/projects/:id/view', checkUser, projectController.recordView);

router.post('/api/projects/:id/like', checkUser, projectController.toggleLike);

router.post('/api/projects/:id/comment', checkUser, projectController.addComment);

router.delete('/api/projects/:projectId/comment/:commentId', checkUser, projectController.deleteComment);

router.put('/api/projects/:id', checkUser, projectController.updateProject);

router.delete('/api/projects/:id', checkUser, projectController.deleteProject);

module.exports = router;         