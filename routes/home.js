const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');
const browseController = require('../controllers/browseController');
const checkuser = require('../middleware/checkUser');
const optionalAuth = require('../middleware/optionalAuth');

// The homeController.getHome is now defined when this line runs
router.get('/home', checkuser, homeController.getHome);

// New routes for modern UI - accessible without login
router.get('/browse', optionalAuth, browseController.getBrowseProjects);
router.get('/project/:id', optionalAuth, browseController.getProjectDetail);

module.exports = router;