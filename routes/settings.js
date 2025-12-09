const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const checkUser = require('../middleware/checkUser');

// Note: GET /settings is handled in pageRoutes (pageController.getSettingsPage)

// Change password
router.post('/change-password', checkUser, settingsController.changePassword);

// Delete account
router.post('/delete-account', checkUser, settingsController.deleteAccount);

// Sign out
router.post('/signout', checkUser, settingsController.signOut);

module.exports = router;
