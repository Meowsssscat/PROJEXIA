const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/recommendationController');

// GET /api/recommendations?limit=10
router.get('/', isAuthenticated, getRecommendations);

module.exports = router;
