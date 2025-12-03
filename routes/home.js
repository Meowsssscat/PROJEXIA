const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');
const browseController = require('../controllers/browseController');
const checkuser = require('../middleware/checkUser');

// The homeController.getHome is now defined when this line runs
router.get('/home', checkuser, homeController.getHome);

// New routes for modern UI
router.get('/browse', browseController.getBrowseProjects);
router.get('/project/:id', browseController.getProjectDetail);

module.exports = router;