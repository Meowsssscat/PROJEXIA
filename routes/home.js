const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');
const checkuser = require('../middleware/checkUser');

// The homeController.getHome is now defined when this line runs
router.get('/home', checkuser, homeController.getHome);

module.exports = router;