const { body, validationResult } = require('express-validator');

const validateLead = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('budget')
    .trim()
    .notEmpty()
    .withMessage('Budget is required')
    .isIn(['< $500', '$500–$1000', '$500-$1000', '$1000–$5000', '$1000-$5000', '>$5000'])
    .withMessage('Invalid budget range selected'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long'),
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
