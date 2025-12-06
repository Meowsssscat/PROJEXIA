const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadProject');
const checkUser = require('../middleware/checkUser');

// Use temporary storage for Multer
const upload = multer({ dest: 'temp/' }); // temp folder for Cloudinary upload

// API routes for projects
// Note: GET /upload is handled in pageRoutes (pageController.getUploadPage)
router.get('/api/projects', checkUser, uploadController.listProjects);
router.post(
  '/api/projects',
  checkUser,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  uploadController.createProject
);

module.exports = router;
