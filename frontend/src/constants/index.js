/**
 * Application Constants
 * Issue #42: Hardcoded values - barcha magic numberlar shu yerda
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_IMAGE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  MAX_FILES: 10
}

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_MESSAGE_LENGTH: 5000
}

// UI Constants
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 400,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  MIN_TOUCH_TARGET: 44 // px - accessibility
}

// Gamification
export const GAMIFICATION = {
  XP_PER_GAME: 20,
  XP_PER_STORY: 15,
  XP_PERFECT_BONUS: 30,
  STREAK_BONUS_MULTIPLIER: 1.5,
  MAX_DAILY_XP: 500,
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000]
}

// Games
export const GAMES = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  DEFAULT_TIME_LIMIT: 60, // seconds
  COMBO_THRESHOLD: 3,
  PERFECT_SCORE_THRESHOLD: 0.9 // 90%
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'pk_token',
  USER: 'pk_user',
  THEME: 'pk_theme',
  LANGUAGE: 'pk_language',
  GAMIFICATION: 'pk_gamification',
  LEARNING_PROGRESS: 'pk_learning_progress',
  GAME_PROGRESS: 'pk_game_progress'
}

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  GAMES: '/games',
  LIBRARY: '/library',
  CURRICULUM: '/curriculum',
  PROFILE: '/my-profile',
  ENROLLMENT: '/enrollment',
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    CHILDREN: '/admin/children',
    GROUPS: '/admin/groups'
  }
}

// Error Messages
export const ERROR_MESSAGES = {
  uz: {
    NETWORK_ERROR: "Internet aloqasi yo'q",
    SERVER_ERROR: "Server xatosi yuz berdi",
    UNAUTHORIZED: "Avtorizatsiya talab qilinadi",
    FORBIDDEN: "Ruxsat berilmagan",
    NOT_FOUND: "Topilmadi",
    VALIDATION_ERROR: "Ma'lumotlar noto'g'ri",
    FILE_TOO_LARGE: "Fayl hajmi juda katta",
    INVALID_FILE_TYPE: "Fayl turi qo'llab-quvvatlanmaydi"
  },
  ru: {
    NETWORK_ERROR: "Нет подключения к интернету",
    SERVER_ERROR: "Ошибка сервера",
    UNAUTHORIZED: "Требуется авторизация",
    FORBIDDEN: "Доступ запрещён",
    NOT_FOUND: "Не найдено",
    VALIDATION_ERROR: "Неверные данные",
    FILE_TOO_LARGE: "Файл слишком большой",
    INVALID_FILE_TYPE: "Тип файла не поддерживается"
  },
  en: {
    NETWORK_ERROR: "No internet connection",
    SERVER_ERROR: "Server error occurred",
    UNAUTHORIZED: "Authorization required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Not found",
    VALIDATION_ERROR: "Invalid data",
    FILE_TOO_LARGE: "File is too large",
    INVALID_FILE_TYPE: "File type not supported"
  }
}

// Success Messages
export const SUCCESS_MESSAGES = {
  uz: {
    SAVED: "Saqlandi",
    DELETED: "O'chirildi",
    UPDATED: "Yangilandi",
    SENT: "Yuborildi"
  },
  ru: {
    SAVED: "Сохранено",
    DELETED: "Удалено",
    UPDATED: "Обновлено",
    SENT: "Отправлено"
  },
  en: {
    SAVED: "Saved",
    DELETED: "Deleted",
    UPDATED: "Updated",
    SENT: "Sent"
  }
}

// Date/Time Formats
export const DATE_FORMATS = {
  DATE: 'DD.MM.YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD.MM.YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
}

// Colors (for consistency)
export const COLORS = {
  PRIMARY: '#6366f1',
  SECONDARY: '#ec4899',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6'
}

export default {
  API_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION,
  UI,
  GAMIFICATION,
  GAMES,
  STORAGE_KEYS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  COLORS
}
