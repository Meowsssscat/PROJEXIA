const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const optionalAuth = require('../middleware/optionalAuth');

// GET /about - accessible without login
router.get('/', optionalAuth, aboutController.getAboutPage);

module.exports = router;
