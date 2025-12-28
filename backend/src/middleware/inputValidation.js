/**
 * Input Validation Middleware
 * Issues Fixed: #4, #7 - Input validation va SQL/NoSQL injection
 */

import { body, param, query, validationResult } from 'express-validator'

// Sanitize string to prevent injection
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/\$/g, '') // Remove MongoDB operators
    .replace(/\{|\}/g, '') // Remove object notation
    .trim()
}

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// Common validation rules
export const commonRules = {
  id: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .customSanitizer(sanitizeString)
}

// Auth validation
export const authValidation = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage('Password is required')
  ],

  register: [
    body('name')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .customSanitizer(sanitizeString)
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isString()
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number')
  ]
}

// Child validation
export const childValidation = {
  create: [
    body('firstName')
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizeString)
      .withMessage('First name must be 2-50 characters'),
    body('lastName')
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizeString)
      .withMessage('Last name must be 2-50 characters'),
    body('birthDate')
      .isISO8601()
      .toDate()
      .withMessage('Valid birth date is required'),
    body('groupId')
      .optional()
      .isMongoId()
      .withMessage('Invalid group ID'),
    body('parentPhone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('parentEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email')
  ],

  update: [
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizeString),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .customSanitizer(sanitizeString),
    body('birthDate')
      .optional()
      .isISO8601()
      .toDate(),
    body('groupId')
      .optional()
      .isMongoId()
  ]
}

// Contact form validation
export const contactValidation = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .customSanitizer(sanitizeString)
    .withMessage('Name must be 2-100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .customSanitizer(sanitizeString)
    .withMessage('Message must be 10-5000 characters')
]

// Enrollment validation
export const enrollmentValidation = [
  body('childName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .customSanitizer(sanitizeString)
    .withMessage('Child name is required'),
  body('childBirthDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid birth date is required'),
  body('parentName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .customSanitizer(sanitizeString)
    .withMessage('Parent name is required'),
  body('parentPhone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('parentEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('address')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .customSanitizer(sanitizeString)
]

// Game progress validation
export const gameProgressValidation = [
  body('childId')
    .isMongoId()
    .withMessage('Valid child ID is required'),
  body('gameType')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .customSanitizer(sanitizeString)
    .withMessage('Game type is required'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Score must be 0-10000'),
  body('maxScore')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max score must be 1-10000'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 86400 })
    .withMessage('Time spent must be 0-86400 seconds')
]

// File upload validation
export const fileValidation = {
  image: [
    body('file').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required')
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed')
      }
      
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (req.file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }
      
      return true
    })
  ]
}

// Sanitize request body middleware
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key])
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key])
        }
      }
    }
    sanitize(req.body)
  }
  next()
}

export default {
  handleValidationErrors,
  commonRules,
  authValidation,
  childValidation,
  contactValidation,
  enrollmentValidation,
  gameProgressValidation,
  fileValidation,
  sanitizeBody
}
