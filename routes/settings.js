const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const checkUser = require('../middleware/checkUser');

// Get settings page
router.get('/', checkUser, settingsController.getSettings);

// Delete account
router.post('/delete-account', checkUser, settingsController.deleteAccount);

// Sign out
router.post('/signout', checkUser, settingsController.signOut);

module.exports = router;
