/**
 * Standardized Error Response Helper
 * Provides consistent error response format across all routes
 */

import logger from './logger.js';

/**
 * Error codes for common scenarios
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

/**
 * HTTP status codes mapping
 */
const statusCodes = {
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502
};

/**
 * Default error messages
 */
const defaultMessages = {
  [ErrorCodes.BAD_REQUEST]: 'Invalid request',
  [ErrorCodes.UNAUTHORIZED]: 'Authentication required',
  [ErrorCodes.FORBIDDEN]: 'Access denied',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.CONFLICT]: 'Resource already exists',
  [ErrorCodes.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests',
  [ErrorCodes.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCodes.DATABASE_ERROR]: 'Database operation failed',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error'
};

/**
 * Create standardized error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code from ErrorCodes
 * @param {string} message - Custom error message (optional)
 * @param {Object} details - Additional error details (optional)
 * @param {Object} meta - Metadata for logging (optional)
 */
export const errorResponse = (res, code, message = null, details = null, meta = {}) => {
  const statusCode = statusCodes[code] || 500;
  const errorMessage = message || defaultMessages[code] || 'An error occurred';
  
  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`${code}: ${errorMessage}`, {
    statusCode,
    code,
    details,
    ...meta
  });
  
  const response = {
    success: false,
    error: {
      code,
      message: errorMessage
    }
  };
  
  // Include details in development or if explicitly allowed
  if (details && (process.env.NODE_ENV === 'development' || details.public)) {
    response.error.details = details.public ? details.data : details;
  }
  
  // Add request ID if available
  if (meta.requestId) {
    response.requestId = meta.requestId;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Create standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message (optional)
 * @param {Object} meta - Additional metadata (optional)
 */
export const successResponse = (res, data, message = null, meta = {}) => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  // Add pagination info if provided
  if (meta.pagination) {
    response.pagination = meta.pagination;
  }
  
  // Add request ID if available
  if (meta.requestId) {
    response.requestId = meta.requestId;
  }
  
  return res.status(meta.statusCode || 200).json(response);
};

/**
 * Create paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 */
export const paginatedResponse = (res, data, pagination) => {
  return res.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page * pagination.limit < pagination.total,
      hasPrev: pagination.page > 1
    }
  });
};

/**
 * Async handler wrapper to catch errors
 * @param {Function} fn - Async route handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async handler error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      
      // Check if it's a known error type
      if (error.isOperational) {
        return errorResponse(res, error.code, error.message, error.details);
      }
      
      // Unknown error
      return errorResponse(res, ErrorCodes.INTERNAL_ERROR, null, null, {
        requestId: req.requestId
      });
    });
  };
};

/**
 * Custom operational error class
 */
export class AppError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error shortcuts
 */
export const errors = {
  badRequest: (message, details) => new AppError(ErrorCodes.BAD_REQUEST, message, details),
  unauthorized: (message) => new AppError(ErrorCodes.UNAUTHORIZED, message),
  forbidden: (message) => new AppError(ErrorCodes.FORBIDDEN, message),
  notFound: (resource = 'Resource') => new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`),
  conflict: (message) => new AppError(ErrorCodes.CONFLICT, message),
  validation: (details) => new AppError(ErrorCodes.VALIDATION_ERROR, 'Validation failed', details),
  internal: (message) => new AppError(ErrorCodes.INTERNAL_ERROR, message)
};

export default {
  errorResponse,
  successResponse,
  paginatedResponse,
  asyncHandler,
  AppError,
  errors,
  ErrorCodes
};
