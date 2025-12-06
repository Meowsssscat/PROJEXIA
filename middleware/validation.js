const { body, validationResult } = require('express-validator');

// Validation rules for signup
const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  
  body('program')
    .notEmpty().withMessage('Program is required')
    .isIn(['BSIT', 'BSIS', 'BSCS']).withMessage('Invalid program selected'),
  
  body('year')
    .notEmpty().withMessage('Year level is required')
    .isIn(['1st', '2nd', '3rd', '4th']).withMessage('Invalid year level selected'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .matches(/@lspu\.edu\.ph$/).withMessage('Please use your LSPU institutional email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

// Validation rules for signin
const signinValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation rules for OTP verification
const otpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array()[0].msg,
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  signupValidation,
  signinValidation,
  otpValidation,
  validate
};