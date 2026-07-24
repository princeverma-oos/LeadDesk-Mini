const { body, validationResult } = require('express-validator');

const validateLead = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .escape(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .escape(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = { validateLead };
