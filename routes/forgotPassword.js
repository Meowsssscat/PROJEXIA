const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Request password reset (send OTP)
router.post('/request', forgotPasswordController.requestPasswordReset);

// Verify reset code
router.post('/verify', forgotPasswordController.verifyResetCode);

// Reset password
router.post('/reset', forgotPasswordController.resetPassword);

// Change password (from settings) - requires auth
const checkUser = require('../middleware/checkUser');
router.post('/change', checkUser, forgotPasswordController.changePassword);

module.exports = router;
