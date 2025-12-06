const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const checkUser = require('../middleware/checkUser');

// Get statistics (public)
router.get('/statistics', footerController.getStatistics);

// Get average rating (public)
router.get('/average-rating', footerController.getAverageRating);

// Get user's rating (requires auth)
router.get('/rating/user', checkUser, footerController.getUserRating);

// Submit rating (requires auth)
router.post('/submit-rating', checkUser, footerController.submitRating);

// Submit issue report (requires auth)
router.post('/report-issue', checkUser, footerController.submitIssueReport);

module.exports = router;
