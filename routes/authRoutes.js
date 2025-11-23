const express = require('express');
const router = express.Router();
const { 
  signup, 
  verifyOTP, 
  signin,
  signout  
} = require('../controllers/authController');
const { 
  signupValidation, 
  signinValidation, 
  otpValidation, 
  validate 
} = require('../middleware/validation');

router.post('/signup', signupValidation, validate, signup);

router.post('/verify-otp', otpValidation, validate, verifyOTP);

router.post('/signin', signinValidation, validate, signin);

router.post('/signout', signout);

module.exports = router;