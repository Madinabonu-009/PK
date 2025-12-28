/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';
import logger from '../utils/logger.js';

// Token storage (in production, use Redis or database)
const tokenStore = new Map();

// Token expiry time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

// Clean expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY) {
      tokenStore.delete(token);
    }
  }
}, 15 * 60 * 1000); // Clean every 15 minutes

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] || req.ip;
  
  tokenStore.set(token, {
    sessionId,
    createdAt: Date.now()
  });
  
  // Set token in response header
  res.setHeader('X-CSRF-Token', token);
  req.csrfToken = token;
  next();
};

/**
 * Validate CSRF token for state-changing requests
 */
export const validateCsrfToken = (req, res, next) => {
  // Skip for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  // Skip for API endpoints that use JWT (they have their own protection)
  // CSRF is mainly for cookie-based auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.headers['x-session-id'] || req.ip;
  
  if (!token) {
    logger.warn('CSRF token missing', { ip: req.ip, path: req.path });
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  
  const storedData = tokenStore.get(token);
  
  if (!storedData) {
    logger.warn('Invalid CSRF token', { ip: req.ip, path: req.path });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Check if token belongs to this session
  if (storedData.sessionId !== sessionId) {
    logger.warn('CSRF token session mismatch', { ip: req.ip, path: req.path });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Check expiry
  if (Date.now() - storedData.createdAt > TOKEN_EXPIRY) {
    tokenStore.delete(token);
    logger.warn('CSRF token expired', { ip: req.ip, path: req.path });
    return res.status(403).json({ error: 'CSRF token expired' });
  }
  
  // Token is valid - delete it (one-time use)
  tokenStore.delete(token);
  next();
};

/**
 * CSRF token endpoint
 */
export const csrfTokenHandler = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] || req.ip;
  
  tokenStore.set(token, {
    sessionId,
    createdAt: Date.now()
  });
  
  res.json({ csrfToken: token });
};

/**
 * Double Submit Cookie pattern (alternative)
 * Sets CSRF token in both cookie and requires it in header
 */
export const doubleSubmitCookie = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(req.method)) {
    // Generate new token for GET requests
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRY
    });
    return next();
  }
  
  // For state-changing requests, validate token
  const cookieToken = req.cookies?.['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn('CSRF double submit validation failed', { ip: req.ip, path: req.path });
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  
  next();
};

export default {
  generateCsrfToken,
  validateCsrfToken,
  csrfTokenHandler,
  doubleSubmitCookie
};
