const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const checkUser = require('../middleware/checkUser');

// Auth pages
router.get('/auth', pageController.getAuthPage);

// Profile pages
router.get('/profile', checkUser, pageController.getProfilePage);
router.get('/profile/:id', pageController.getProfilePage);
router.get('/editProfile', checkUser, pageController.getEditProfilePage);

// Upload page
router.get('/upload', checkUser, pageController.getUploadPage);

// Settings page
router.get('/settings', checkUser, pageController.getSettingsPage);

// Support pages
router.get('/donate', pageController.getDonatePage);
router.get('/report', checkUser, pageController.getReportPage);

// Forgot password page
router.get('/forgot-password', pageController.getForgotPasswordPage);

module.exports = router;
