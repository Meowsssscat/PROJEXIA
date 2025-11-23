const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const checkUser = require('../middleware/checkUser');

// GET /about
router.get('/', checkUser, aboutController.getAboutPage);

module.exports = router;
