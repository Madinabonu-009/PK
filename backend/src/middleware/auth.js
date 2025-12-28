import jwt from 'jsonwebtoken'
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js'

// JWT Secret validation
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'play-kids-secret-key' || JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET is weak or not set. Please set a strong secret in .env file!')
}
const SECURE_JWT_SECRET = JWT_SECRET || 'play-kids-secret-key-' + Date.now()

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = '7d'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ 
      error: 'Token has been revoked', 
      code: 'TOKEN_REVOKED' 
    })
  }

  try {
    const decoded = jwt.verify(token, SECURE_JWT_SECRET)
    req.user = decoded
    req.token = token // Store token for potential blacklisting
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECURE_JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    SECURE_JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  )
}

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECURE_JWT_SECRET)
    if (decoded.type !== 'refresh') {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

// Role-based access control middleware
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' })
    }
    
    next()
  }
}

// Admin only middleware
export const adminOnly = requireRole('admin')

// Teacher or Admin middleware
export const teacherOrAdmin = requireRole('admin', 'teacher')

export { SECURE_JWT_SECRET as JWT_SECRET }
