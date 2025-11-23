const express = require('express');
const router = express.Router();
const otherProfileCon = require('../controllers/otherProfileController');
const checkUser = require('../middleware/checkUser');

// Notice ':id' here
router.get('/:id', checkUser, otherProfileCon.getProfile);

module.exports = router;
