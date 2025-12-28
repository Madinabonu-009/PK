/**
 * Backend Constants
 */

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  SICK: 'sick',
  VACATION: 'vacation'
}

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer'
}

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

// Enrollment Status
export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WAITLIST: 'waitlist'
}

// Feedback Categories
export const FEEDBACK_CATEGORIES = {
  TEACHING: 'teaching',
  FACILITIES: 'facilities',
  STAFF: 'staff',
  FOOD: 'food',
  OTHER: 'other'
}

// Blog Categories
export const BLOG_CATEGORIES = {
  NEWS: 'news',
  EVENTS: 'events',
  EDUCATION: 'education',
  HEALTH: 'health',
  TIPS: 'tips'
}

// Event Categories
export const EVENT_CATEGORIES = {
  HOLIDAY: 'holiday',
  PERFORMANCE: 'performance',
  MEETING: 'meeting',
  EXCURSION: 'excursion',
  COMPETITION: 'competition',
  OTHER: 'other'
}

// Meal Types
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  SNACK: 'snack',
  DINNER: 'dinner'
}

// Meal Portions
export const MEAL_PORTIONS = {
  ALL: 'all',
  SOME: 'some',
  NONE: 'none'
}

// Sleep Quality
export const SLEEP_QUALITY = {
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
}

// Mood Types
export const MOOD_TYPES = {
  HAPPY: 'happy',
  SAD: 'sad',
  NEUTRAL: 'neutral',
  EXCITED: 'excited',
  TIRED: 'tired',
  ANGRY: 'angry'
}

// File Types
export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  AUDIO: 'audio'
}

// Allowed File Extensions
export const ALLOWED_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  VIDEO: ['.mp4', '.webm', '.ogg'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt'],
  AUDIO: ['.mp3', '.wav', '.ogg']
}

// Max File Sizes (bytes)
export const MAX_FILE_SIZE = {
  IMAGE: 2 * 1024 * 1024, // 2MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
  AUDIO: 10 * 1024 * 1024 // 10MB
}

// Validation Limits
export const VALIDATION_LIMITS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_ADDRESS_LENGTH: 500,
  MIN_AGE: 0,
  MAX_AGE: 10,
  MIN_GROUP_CAPACITY: 1,
  MAX_GROUP_CAPACITY: 50
}

// Rate Limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  API: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX_REQUESTS: 60
  }
}

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  ALGORITHM: 'HS256'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid username or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_REVOKED: 'Token has been revoked',
  ACCOUNT_LOCKED: 'Account temporarily locked',
  DUPLICATE_ENTRY: 'Record already exists',
  INVALID_INPUT: 'Invalid input data'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_SENT: 'Email sent successfully'
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

// Data File Names
export const DATA_FILES = {
  USERS: 'users.json',
  CHILDREN: 'children.json',
  GROUPS: 'groups.json',
  TEACHERS: 'teachers.json',
  ENROLLMENTS: 'enrollments.json',
  PAYMENTS: 'payments.json',
  ATTENDANCE: 'attendance.json',
  DAILY_REPORTS: 'dailyReports.json',
  DEBTS: 'debts.json',
  BLOG: 'blog.json',
  EVENTS: 'events.json',
  FEEDBACK: 'feedback.json',
  JOURNAL: 'journal.json',
  MENU: 'menu.json',
  ACHIEVEMENTS: 'achievements.json',
  STORIES: 'stories.json',
  PROGRESS: 'progress.json',
  CURRICULUM: 'curriculum.json'
}

// Cron Job Schedules
export const CRON_SCHEDULES = {
  DAILY_BACKUP: '0 2 * * *', // 2 AM daily
  WEEKLY_REPORT: '0 9 * * 1', // 9 AM every Monday
  MONTHLY_INVOICE: '0 10 1 * *', // 10 AM on 1st of month
  CLEANUP_LOGS: '0 3 * * 0', // 3 AM every Sunday
  CHECK_DEBTS: '0 8 * * *' // 8 AM daily
}

// Telegram Bot Commands
export const BOT_COMMANDS = {
  START: '/start',
  HELP: '/help',
  MENU: '/menu',
  ATTENDANCE: '/attendance',
  PAYMENTS: '/payments',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  ENROLLMENT: 'enrollment',
  PAYMENT: 'payment',
  ATTENDANCE: 'attendance',
  REPORT: 'report',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder'
}

// Cache TTL (seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400 // 24 hours
}

export default {
  ROLES,
  ATTENDANCE_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  ENROLLMENT_STATUS,
  FEEDBACK_CATEGORIES,
  BLOG_CATEGORIES,
  EVENT_CATEGORIES,
  MEAL_TYPES,
  MEAL_PORTIONS,
  SLEEP_QUALITY,
  MOOD_TYPES,
  FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  VALIDATION_LIMITS,
  RATE_LIMITS,
  JWT_CONFIG,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  DATA_FILES,
  CRON_SCHEDULES,
  BOT_COMMANDS,
  NOTIFICATION_TYPES,
  CACHE_TTL
}
