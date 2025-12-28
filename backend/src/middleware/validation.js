/**
 * Input Validation Middleware using Joi
 */

import Joi from 'joi'
import logger from '../utils/logger.js'

/**
 * Validate request against Joi schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      // Log validation failures for security monitoring
      logger.warn('Validation failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        errors: errors,
        body: sanitizeLogBody(req.body)
      })
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        }
      })
    }
    
    // Replace body with validated and sanitized data
    req.body = value
    next()
  }
}

/**
 * Sanitize request body for logging (remove sensitive fields)
 */
const sanitizeLogBody = (body) => {
  if (!body || typeof body !== 'object') return {}
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * Common validation schemas
 */
export const schemas = {
  // User registration/login
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
  }),
  
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-])/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character (@$!%*?&#^()_+=\\-)'
      }),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('admin', 'teacher', 'parent').default('teacher')
  }),
  
  // Child
  child: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(0).max(10).required(),
    groupId: Joi.string().required(),
    parentName: Joi.string().min(2).max(100).required(),
    parentPhone: Joi.string()
      .pattern(/^\+998[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone must be in format +998XXXXXXXXX'
      }),
    parentEmail: Joi.string().email().optional().allow(''),
    address: Joi.string().max(500).optional().allow(''),
    medicalInfo: Joi.string().max(1000).optional().allow(''),
    photo: Joi.string().uri().optional().allow('')
  }),
  
  // Group
  group: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    ageRange: Joi.string().required(),
    capacity: Joi.number().integer().min(1).max(50).required(),
    teacherId: Joi.string().required(),
    schedule: Joi.string().max(500).optional().allow(''),
    description: Joi.string().max(1000).optional().allow('')
  }),
  
  // Enrollment
  enrollment: Joi.object({
    childName: Joi.string().min(2).max(100).required(),
    childAge: Joi.number().integer().min(0).max(10).required(),
    parentName: Joi.string().min(2).max(100).required(),
    parentPhone: Joi.string()
      .pattern(/^\+998[0-9]{9}$/)
      .required(),
    parentEmail: Joi.string().email().optional().allow(''),
    preferredGroup: Joi.string().optional().allow(''),
    message: Joi.string().max(1000).optional().allow('')
  }),
  
  // Feedback
  feedback: Joi.object({
    parentName: Joi.string().min(2).max(100).required(),
    parentEmail: Joi.string().email().optional().allow(''),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(10).max(1000).required(),
    category: Joi.string().valid('teaching', 'facilities', 'staff', 'food', 'other').optional()
  }),
  
  // Contact
  contact: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^\+998[0-9]{9}$/)
      .required(),
    email: Joi.string().email().optional().allow(''),
    message: Joi.string().min(10).max(1000).required()
  }),
  
  // Blog post
  blogPost: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(50).max(10000).required(),
    excerpt: Joi.string().max(500).optional().allow(''),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    image: Joi.string().uri().optional().allow(''),
    published: Joi.boolean().default(false)
  }),
  
  // Event
  event: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(1000).optional().allow(''),
    date: Joi.date().iso().required(),
    time: Joi.string().optional().allow(''),
    location: Joi.string().max(200).optional().allow(''),
    category: Joi.string().required(),
    image: Joi.string().uri().optional().allow('')
  }),
  
  // Payment
  payment: Joi.object({
    childId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    month: Joi.string()
      .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
      .required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'transfer').required(),
    notes: Joi.string().max(500).optional().allow('')
  }),
  
  // Attendance
  attendance: Joi.object({
    childId: Joi.string().required(),
    date: Joi.date().iso().required(),
    status: Joi.string().valid('present', 'absent', 'sick', 'vacation').required(),
    notes: Joi.string().max(500).optional().allow('')
  }),
  
  // Daily report - Comprehensive schema
  dailyReport: Joi.object({
    childId: Joi.string().required(),
    
    // Kelish ma'lumotlari
    arrival: Joi.object({
      time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      broughtBy: Joi.string().valid('mother', 'father', 'grandparent', 'relative', 'other').allow(''),
      broughtByName: Joi.string().max(100).allow(''),
      broughtByRelation: Joi.string().max(50).allow(''),
      condition: Joi.string().valid('good', 'sick', 'tired', 'upset').default('good'),
      notes: Joi.string().max(500).allow('')
    }).optional(),
    
    // Ketish ma'lumotlari
    departure: Joi.object({
      time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      pickedUpBy: Joi.string().valid('mother', 'father', 'grandparent', 'relative', 'other').allow(''),
      pickedUpByName: Joi.string().max(100).allow(''),
      pickedUpByRelation: Joi.string().max(50).allow(''),
      condition: Joi.string().valid('good', 'tired', 'upset').default('good'),
      notes: Joi.string().max(500).allow('')
    }).optional(),
    
    // Ovqatlanish
    meals: Joi.object({
      breakfast: Joi.object({
        items: Joi.array().items(Joi.string().max(100)).max(20).optional(),
        eaten: Joi.object().pattern(Joi.string(), Joi.string().valid('full', 'partial', 'none')).optional(),
        notes: Joi.string().max(500).allow(''),
        appetite: Joi.string().valid('good', 'normal', 'poor').default('good')
      }).optional(),
      lunch: Joi.object({
        items: Joi.array().items(Joi.string().max(100)).max(20).optional(),
        eaten: Joi.object().pattern(Joi.string(), Joi.string().valid('full', 'partial', 'none')).optional(),
        notes: Joi.string().max(500).allow(''),
        appetite: Joi.string().valid('good', 'normal', 'poor').default('good')
      }).optional(),
      snack: Joi.object({
        items: Joi.array().items(Joi.string().max(100)).max(20).optional(),
        eaten: Joi.object().pattern(Joi.string(), Joi.string().valid('full', 'partial', 'none')).optional(),
        notes: Joi.string().max(500).allow(''),
        appetite: Joi.string().valid('good', 'normal', 'poor').default('good')
      }).optional()
    }).optional(),
    
    // Uyqu
    sleep: Joi.object({
      slept: Joi.boolean().default(false),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      duration: Joi.number().min(0).max(480).default(0),
      quality: Joi.string().valid('good', 'normal', 'restless', 'none').default('normal'),
      fellAsleepEasily: Joi.boolean().default(true),
      wokeUpDuring: Joi.boolean().default(false),
      notes: Joi.string().max(500).allow('')
    }).optional(),
    
    // Kayfiyat
    mood: Joi.object({
      morning: Joi.object({
        mood: Joi.string().valid('happy', 'calm', 'sad', 'angry', 'tired', 'neutral', 'excited').default('neutral'),
        energy: Joi.string().valid('high', 'normal', 'low').default('normal'),
        notes: Joi.string().max(200).allow('')
      }).optional(),
      midday: Joi.object({
        mood: Joi.string().valid('happy', 'calm', 'sad', 'angry', 'tired', 'neutral', 'excited').default('neutral'),
        energy: Joi.string().valid('high', 'normal', 'low').default('normal'),
        notes: Joi.string().max(200).allow('')
      }).optional(),
      afternoon: Joi.object({
        mood: Joi.string().valid('happy', 'calm', 'sad', 'angry', 'tired', 'neutral', 'excited').default('neutral'),
        energy: Joi.string().valid('high', 'normal', 'low').default('normal'),
        notes: Joi.string().max(200).allow('')
      }).optional(),
      evening: Joi.object({
        mood: Joi.string().valid('happy', 'calm', 'sad', 'angry', 'tired', 'neutral', 'excited').default('neutral'),
        energy: Joi.string().valid('high', 'normal', 'low').default('normal'),
        notes: Joi.string().max(200).allow('')
      }).optional()
    }).optional(),
    
    // Faoliyatlar
    activities: Joi.array().items(Joi.object({
      type: Joi.string().valid('art', 'play', 'learning', 'music', 'sport', 'outdoor', 'social', 'other').required(),
      description: Joi.string().max(200).allow(''),
      notes: Joi.string().max(200).allow('')
    })).max(20).optional(),
    
    // Sog'liq
    health: Joi.object({
      temperature: Joi.number().min(35).max(42).allow(null, ''),
      symptoms: Joi.array().items(Joi.string().valid('cough', 'runny_nose', 'fever', 'rash', 'vomiting', 'diarrhea')).max(10).optional(),
      medications: Joi.array().items(Joi.string().max(100)).max(10).optional(),
      injuries: Joi.array().items(Joi.string().max(200)).max(10).optional(),
      notes: Joi.string().max(500).allow('')
    }).optional(),
    
    // Gigiena
    hygiene: Joi.object({
      diaper: Joi.object({
        changes: Joi.number().min(0).max(20).default(0),
        wet: Joi.number().min(0).max(20).default(0),
        dirty: Joi.number().min(0).max(20).default(0),
        notes: Joi.string().max(200).allow('')
      }).optional(),
      potty: Joi.object({
        attempts: Joi.number().min(0).max(20).default(0),
        successes: Joi.number().min(0).max(20).default(0),
        accidents: Joi.number().min(0).max(20).default(0),
        notes: Joi.string().max(200).allow('')
      }).optional(),
      handWashing: Joi.boolean().default(true),
      teethBrushing: Joi.boolean().default(false),
      notes: Joi.string().max(200).allow('')
    }).optional(),
    
    // Xulq-atvor
    behavior: Joi.object({
      overall: Joi.string().valid('excellent', 'good', 'fair', 'challenging').default('good'),
      sharing: Joi.boolean().default(true),
      listening: Joi.boolean().default(true),
      following_rules: Joi.boolean().default(true),
      incidents: Joi.array().items(Joi.string().max(200)).max(10).optional(),
      positive_moments: Joi.array().items(Joi.string().max(200)).max(10).optional(),
      notes: Joi.string().max(500).allow('')
    }).optional(),
    
    // Izohlar
    teacherNotes: Joi.string().max(2000).allow(''),
    parentNotes: Joi.string().max(2000).allow('')
  }),
  
  // Pagination query
  pagination: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100).allow(''),
    groupId: Joi.string().max(50).allow(''),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(''),
    childId: Joi.string().max(50).allow('')
  }),
  
  // Telegram ID validation
  telegramId: Joi.string().pattern(/^\d+$/).max(20)
}

/**
 * Validate query parameters
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: errors
      })
    }
    
    req.query = value
    next()
  }
}

/**
 * Validate URL parameters
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    })
    
    if (error) {
      return res.status(400).json({
        error: 'Invalid URL parameters',
        details: error.details.map(d => d.message)
      })
    }
    
    req.params = value
    next()
  }
}

export default {
  validate,
  validateQuery,
  validateParams,
  schemas
}
