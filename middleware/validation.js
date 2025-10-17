const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

const validateRegistration = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateOpportunity = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['bursary', 'internship', 'graduate', 'learnership'])
    .withMessage('Invalid category'),
  
  body('field')
    .notEmpty()
    .withMessage('Field is required'),
  
  body('provider')
    .notEmpty()
    .withMessage('Provider is required'),
  
  body('applicationDeadline')
    .notEmpty()
    .withMessage('Application deadline is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  
  handleValidationErrors
];

// Aliases for auth routes
const validateUserRegistration = validateRegistration;
const validateUserLogin = validateLogin;

module.exports = {
  validateRegistration,
  validateLogin,
  validateUserRegistration,
  validateUserLogin,
  validateOpportunity
};