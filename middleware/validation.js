const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const verifyOtpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
  validate
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  validate
];

const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('token')
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const createAdminValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'd-admin']).withMessage('Role must be either admin or d-admin'),
  validate
];

// Post validations
const createPostValidation = [
  body('text')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Text must not exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['All', 'Level', 'Department', 'Exam', 'Timetable', 'Event'])
    .withMessage('Invalid category'),
  validate
];

const addCommentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters'),
  validate
];

// Channel validations
const createChannelValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Channel name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'private']).withMessage('Visibility must be public or private'),
  validate
];

// Event validations
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('details')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Details must not exceed 2000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),
  body('startsAt')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  validate
];

// Timetable validations
const createTimetableValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Timetable title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('details')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Details must not exceed 2000 characters'),
  body('effectiveDate')
    .notEmpty().withMessage('Effective date is required')
    .isISO8601().withMessage('Effective date must be a valid date'),
  validate
];

// Profile validations
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('level')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Level must not exceed 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department must not exceed 100 characters'),
  body('faculty')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Faculty must not exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', '']).withMessage('Invalid gender value'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
  validate
];

// ID parameter validation
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  createAdminValidation,
  createPostValidation,
  addCommentValidation,
  createChannelValidation,
  createEventValidation,
  createTimetableValidation,
  updateProfileValidation,
  mongoIdValidation,
};
