import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { readData } from '../utils/db.js';
import logger from '../utils/logger.js';
import DOMPurify from 'isomorphic-dompurify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Allowed data files - security measure against path traversal
const ALLOWED_FILES = ['dailyReports.json', 'children.json', 'menu.json'];
const DATA_DIR = path.resolve(__dirname, '../../data');

// Secure file path validation
const getSecureFilePath = (filename) => {
  if (!ALLOWED_FILES.includes(filename)) {
    throw new Error('Invalid file access');
  }
  const filePath = path.join(DATA_DIR, filename);
  // Prevent path traversal
  if (!filePath.startsWith(DATA_DIR)) {
    throw new Error('Invalid file path');
  }
  return filePath;
};

const readReports = () => {
  try {
    const filePath = getSecureFilePath('dailyReports.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    logger.warn('Failed to read reports file, returning empty array');
    return [];
  }
};

const writeReports = (data) => {
  try {
    const filePath = getSecureFilePath('dailyReports.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    logger.error('Failed to write reports file', { error: error.message });
    return false;
  }
};

const readChildren = () => {
  try {
    const filePath = getSecureFilePath('children.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    logger.warn('Failed to read children file, returning empty array');
    return [];
  }
};

// Sanitize text input to prevent XSS
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text.trim(), { ALLOWED_TAGS: [] });
};

// Validate date format
const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Validate Telegram ID
const isValidTelegramId = (id) => {
  if (!id) return false;
  return /^\d{5,15}$/.test(String(id));
};

// Bugungi menyu olish
const getTodayMenu = () => {
  try {
    const menu = readData('menu.json');
    if (!menu) return null;
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return menu[today] || null;
  } catch (error) {
    logger.warn('Failed to get today menu', { error: error.message });
    return null;
  }
};

// Audit logging
const auditLog = (action, userId, resourceId, details = {}) => {
  logger.info('AUDIT', {
    action,
    userId,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
};

// Check if user can access child data
const canAccessChild = (user, child, children) => {
  if (!user || !child) return false;
  if (user.role === 'admin' || user.role === 'teacher') return true;
  if (user.role === 'parent') {
    const childData = children.find(c => c.id === child);
    return childData && childData.parentId === user.id;
  }
  return false;
};

// Barcha hisobotlar - with pagination validation
router.get('/', authenticateToken, (req, res) => {
  try {
    const { date, childId, groupId, page = 1, limit = 20 } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, Math.min(parseInt(page) || 1, 1000));
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 20, 100));
    const skip = (pageNum - 1) * limitNum;
    
    // Validate date if provided
    if (date && !isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const reports = readReports();
    const children = readChildren();
    
    let filtered = reports;
    
    if (date) {
      filtered = filtered.filter(r => r.date === date);
    }
    if (childId) {
      // Check access permission
      if (!canAccessChild(req.user, childId, children)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      filtered = filtered.filter(r => r.childId === childId);
    }
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c.id);
      filtered = filtered.filter(r => groupChildIds.includes(r.childId));
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);
    
    // Bola ma'lumotlarini qo'shish
    const result = paginated.map(report => {
      const child = children.find(c => c.id === report.childId);
      return {
        ...report,
        childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
        childPhoto: child?.photo,
        parentPhone: child?.parentPhone
      };
    });
    
    res.json({
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Daily reports fetch error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Bugungi menyu olish (hisobot uchun) - role restricted
router.get('/today-menu', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const menu = getTodayMenu();
    res.json(menu || {});
  } catch (error) {
    logger.error('Today menu fetch error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Bitta hisobot
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const reports = readReports();
    const children = readChildren();
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check access permission
    if (!canAccessChild(req.user, report.childId, children)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const child = children.find(c => c.id === report.childId);
    res.json({
      ...report,
      childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
      childPhoto: child?.photo
    });
  } catch (error) {
    logger.error('Report fetch error', { error: error.message, reportId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Yangi hisobot yaratish - with full validation
router.post('/', authenticateToken, requireRole('admin', 'teacher'), validate(schemas.dailyReport), async (req, res) => {
  try {
    const reports = readReports();
    const children = readChildren();
    const { childId } = req.body;
    
    const child = children.find(c => c.id === childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Bugungi hisobot bormi tekshirish
    const existing = reports.find(r => r.childId === childId && r.date === today);
    if (existing) {
      return res.status(400).json({ error: 'Report already exists for today' });
    }
    
    // Sanitize text fields
    const sanitizedData = {
      ...req.body,
      teacherNotes: sanitizeText(req.body.teacherNotes),
      parentNotes: sanitizeText(req.body.parentNotes)
    };
    
    // Sanitize nested notes
    if (sanitizedData.arrival?.notes) {
      sanitizedData.arrival.notes = sanitizeText(sanitizedData.arrival.notes);
    }
    if (sanitizedData.departure?.notes) {
      sanitizedData.departure.notes = sanitizeText(sanitizedData.departure.notes);
    }
    if (sanitizedData.sleep?.notes) {
      sanitizedData.sleep.notes = sanitizeText(sanitizedData.sleep.notes);
    }
    if (sanitizedData.health?.notes) {
      sanitizedData.health.notes = sanitizeText(sanitizedData.health.notes);
    }
    if (sanitizedData.behavior?.notes) {
      sanitizedData.behavior.notes = sanitizeText(sanitizedData.behavior.notes);
    }
    
    const newReport = {
      id: `dr${Date.now()}`,
      childId,
      date: today,
      arrival: sanitizedData.arrival || getDefaultArrival(),
      departure: sanitizedData.departure || getDefaultDeparture(),
      meals: sanitizedData.meals || getDefaultMeals(),
      sleep: sanitizedData.sleep || getDefaultSleep(),
      mood: sanitizedData.mood || getDefaultMood(),
      activities: sanitizedData.activities || [],
      health: sanitizedData.health || getDefaultHealth(),
      hygiene: sanitizedData.hygiene || getDefaultHygiene(),
      behavior: sanitizedData.behavior || getDefaultBehavior(),
      teacherNotes: sanitizedData.teacherNotes || '',
      parentNotes: sanitizedData.parentNotes || '',
      createdBy: req.user.id,
      createdByName: req.user.username,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      telegramSent: false,
      telegramSentAt: null
    };
    
    reports.push(newReport);
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to save report' });
    }
    
    // Audit log
    auditLog('CREATE_REPORT', req.user.id, newReport.id, { childId, ip: req.ip });
    
    res.status(201).json(newReport);
  } catch (error) {
    logger.error('Create report error', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to create report' });
  }
});


// Default value generators
function getDefaultArrival() {
  return {
    time: null,
    broughtBy: '',
    broughtByName: '',
    broughtByRelation: '',
    condition: 'good',
    notes: ''
  };
}

function getDefaultDeparture() {
  return {
    time: null,
    pickedUpBy: '',
    pickedUpByName: '',
    pickedUpByRelation: '',
    condition: 'good',
    notes: ''
  };
}

function getDefaultMeals() {
  return {
    breakfast: { items: [], eaten: {}, notes: '', appetite: 'good' },
    lunch: { items: [], eaten: {}, notes: '', appetite: 'good' },
    snack: { items: [], eaten: {}, notes: '', appetite: 'good' }
  };
}

function getDefaultSleep() {
  return {
    slept: false,
    startTime: null,
    endTime: null,
    duration: 0,
    quality: 'normal',
    fellAsleepEasily: true,
    wokeUpDuring: false,
    notes: ''
  };
}

function getDefaultMood() {
  return {
    morning: { mood: 'neutral', energy: 'normal', notes: '' },
    midday: { mood: 'neutral', energy: 'normal', notes: '' },
    afternoon: { mood: 'neutral', energy: 'normal', notes: '' },
    evening: { mood: 'neutral', energy: 'normal', notes: '' }
  };
}

function getDefaultHealth() {
  return {
    temperature: null,
    symptoms: [],
    medications: [],
    injuries: [],
    notes: ''
  };
}

function getDefaultHygiene() {
  return {
    diaper: { changes: 0, wet: 0, dirty: 0, notes: '' },
    potty: { attempts: 0, successes: 0, accidents: 0, notes: '' },
    handWashing: true,
    teethBrushing: false,
    notes: ''
  };
}

function getDefaultBehavior() {
  return {
    overall: 'good',
    sharing: true,
    listening: true,
    following_rules: true,
    incidents: [],
    positive_moments: [],
    notes: ''
  };
}

// Hisobotni yangilash
router.put('/:id', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const reports = readReports();
    const index = reports.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const allowedFields = [
      'arrival', 'departure', 'meals', 'sleep', 'mood', 
      'activities', 'health', 'hygiene', 'behavior', 
      'teacherNotes', 'parentNotes'
    ];
    
    // Sanitize and update allowed fields only
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'teacherNotes' || field === 'parentNotes') {
          reports[index][field] = sanitizeText(req.body[field]);
        } else {
          reports[index][field] = req.body[field];
        }
      }
    });
    
    reports[index].updatedAt = new Date().toISOString();
    reports[index].updatedBy = req.user.id;
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to update report' });
    }
    
    // Audit log
    auditLog('UPDATE_REPORT', req.user.id, req.params.id, { ip: req.ip });
    
    res.json(reports[index]);
  } catch (error) {
    logger.error('Update report error', { error: error.message, reportId: req.params.id });
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Kelish vaqtini belgilash
router.post('/:childId/arrival', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const { childId } = req.params;
    const { time, broughtBy, broughtByName, broughtByRelation, condition, notes } = req.body;
    
    // Validate broughtBy
    const validBroughtBy = ['mother', 'father', 'grandparent', 'relative', 'other'];
    if (broughtBy && !validBroughtBy.includes(broughtBy)) {
      return res.status(400).json({ error: 'Invalid broughtBy value' });
    }
    
    // Validate condition
    const validConditions = ['good', 'sick', 'tired', 'upset'];
    if (condition && !validConditions.includes(condition)) {
      return res.status(400).json({ error: 'Invalid condition value' });
    }
    
    const reports = readReports();
    const children = readChildren();
    const today = new Date().toISOString().split('T')[0];
    
    const child = children.find(c => c.id === childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    let report = reports.find(r => r.childId === childId && r.date === today);
    
    if (!report) {
      report = {
        id: `dr${Date.now()}`,
        childId,
        date: today,
        arrival: {},
        departure: {},
        meals: getDefaultMeals(),
        sleep: getDefaultSleep(),
        mood: getDefaultMood(),
        activities: [],
        health: getDefaultHealth(),
        hygiene: getDefaultHygiene(),
        behavior: getDefaultBehavior(),
        teacherNotes: '',
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        telegramSent: false
      };
      reports.push(report);
    }
    
    report.arrival = {
      time: time || new Date().toTimeString().slice(0, 5),
      broughtBy: broughtBy || '',
      broughtByName: sanitizeText(broughtByName) || '',
      broughtByRelation: sanitizeText(broughtByRelation) || '',
      condition: condition || 'good',
      notes: sanitizeText(notes) || ''
    };
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to save arrival' });
    }
    
    auditLog('RECORD_ARRIVAL', req.user.id, report.id, { childId, ip: req.ip });
    
    res.json(report);
  } catch (error) {
    logger.error('Record arrival error', { error: error.message, childId: req.params.childId });
    res.status(500).json({ error: 'Failed to record arrival' });
  }
});

// Ketish vaqtini belgilash
router.post('/:childId/departure', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const { childId } = req.params;
    const { time, pickedUpBy, pickedUpByName, pickedUpByRelation, condition, notes } = req.body;
    
    // Validate pickedUpBy
    const validPickedUpBy = ['mother', 'father', 'grandparent', 'relative', 'other'];
    if (pickedUpBy && !validPickedUpBy.includes(pickedUpBy)) {
      return res.status(400).json({ error: 'Invalid pickedUpBy value' });
    }
    
    // Validate condition
    const validConditions = ['good', 'tired', 'upset'];
    if (condition && !validConditions.includes(condition)) {
      return res.status(400).json({ error: 'Invalid condition value' });
    }
    
    const reports = readReports();
    const today = new Date().toISOString().split('T')[0];
    
    const report = reports.find(r => r.childId === childId && r.date === today);
    
    if (!report) {
      return res.status(404).json({ error: 'No report found for today. Record arrival first.' });
    }
    
    report.departure = {
      time: time || new Date().toTimeString().slice(0, 5),
      pickedUpBy: pickedUpBy || '',
      pickedUpByName: sanitizeText(pickedUpByName) || '',
      pickedUpByRelation: sanitizeText(pickedUpByRelation) || '',
      condition: condition || 'good',
      notes: sanitizeText(notes) || ''
    };
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to save departure' });
    }
    
    auditLog('RECORD_DEPARTURE', req.user.id, report.id, { childId, ip: req.ip });
    
    res.json(report);
  } catch (error) {
    logger.error('Record departure error', { error: error.message, childId: req.params.childId });
    res.status(500).json({ error: 'Failed to record departure' });
  }
});

// Ovqatlanishni belgilash
router.post('/:childId/meal/:mealType', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const { childId, mealType } = req.params;
    const { items, eaten, notes, appetite } = req.body;
    
    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: 'Invalid meal type. Must be breakfast, lunch, or snack' });
    }
    
    // Validate appetite
    const validAppetite = ['good', 'normal', 'poor'];
    if (appetite && !validAppetite.includes(appetite)) {
      return res.status(400).json({ error: 'Invalid appetite value' });
    }
    
    // Validate eaten values
    if (eaten && typeof eaten === 'object') {
      const validEatenValues = ['full', 'partial', 'none'];
      for (const value of Object.values(eaten)) {
        if (!validEatenValues.includes(value)) {
          return res.status(400).json({ error: 'Invalid eaten value. Must be full, partial, or none' });
        }
      }
    }
    
    const reports = readReports();
    const today = new Date().toISOString().split('T')[0];
    
    let report = reports.find(r => r.childId === childId && r.date === today);
    
    if (!report) {
      return res.status(404).json({ error: 'No report found for today' });
    }
    
    if (!report.meals) report.meals = {};
    
    report.meals[mealType] = {
      items: Array.isArray(items) ? items.slice(0, 20) : [],
      eaten: eaten || {},
      notes: sanitizeText(notes) || '',
      appetite: appetite || 'good',
      recordedAt: new Date().toISOString()
    };
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to save meal' });
    }
    
    auditLog('RECORD_MEAL', req.user.id, report.id, { childId, mealType, ip: req.ip });
    
    res.json(report);
  } catch (error) {
    logger.error('Record meal error', { error: error.message, childId: req.params.childId });
    res.status(500).json({ error: 'Failed to record meal' });
  }
});


// Telegramga yuborish - with validation
router.post('/:id/send-telegram', authenticateToken, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const reports = readReports();
    const children = readChildren();
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const child = children.find(c => c.id === report.childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    // Validate Telegram ID
    const chatId = child.parentTelegram || process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
      return res.status(400).json({ error: 'No Telegram chat ID configured' });
    }
    
    if (!isValidTelegramId(chatId)) {
      logger.warn('Invalid Telegram ID', { chatId, childId: child.id });
      return res.status(400).json({ error: 'Invalid Telegram chat ID' });
    }
    
    const message = formatReportForTelegram(report, child);
    
    // Send with error handling
    let result;
    try {
      result = await sendTelegramMessage(message, chatId);
    } catch (telegramError) {
      logger.error('Telegram send error', { error: telegramError.message, chatId });
      return res.status(500).json({ error: 'Failed to send Telegram message' });
    }
    
    if (result) {
      const index = reports.findIndex(r => r.id === req.params.id);
      reports[index].telegramSent = true;
      reports[index].telegramSentAt = new Date().toISOString();
      
      if (!writeReports(reports)) {
        logger.warn('Failed to update telegram status', { reportId: req.params.id });
      }
      
      auditLog('SEND_TELEGRAM', req.user.id, req.params.id, { chatId, ip: req.ip });
      
      res.json({ success: true, message: 'Report sent to Telegram' });
    } else {
      res.status(500).json({ error: 'Failed to send Telegram message' });
    }
  } catch (error) {
    logger.error('Send telegram error', { error: error.message, reportId: req.params.id });
    res.status(500).json({ error: 'Failed to send report' });
  }
});

// Bola hisobotlari tarixi
router.get('/child/:childId/history', authenticateToken, (req, res) => {
  try {
    const { childId } = req.params;
    const { limit = 30 } = req.query;
    
    // Validate limit
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 30, 100));
    
    const reports = readReports();
    const children = readChildren();
    
    // Check access permission
    if (!canAccessChild(req.user, childId, children)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const childReports = reports
      .filter(r => r.childId === childId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limitNum);
    
    res.json(childReports);
  } catch (error) {
    logger.error('Child history error', { error: error.message, childId: req.params.childId });
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Hisobotni o'chirish (soft delete)
router.delete('/:id', authenticateToken, requireRole('admin', 'teacher'), (req, res) => {
  try {
    const reports = readReports();
    const index = reports.findIndex(r => r.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Soft delete - mark as deleted instead of removing
    reports[index].deletedAt = new Date().toISOString();
    reports[index].deletedBy = req.user.id;
    reports[index].isDeleted = true;
    
    if (!writeReports(reports)) {
      return res.status(500).json({ error: 'Failed to delete report' });
    }
    
    auditLog('DELETE_REPORT', req.user.id, req.params.id, { ip: req.ip });
    
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    logger.error('Delete report error', { error: error.message, reportId: req.params.id });
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Export reports as CSV
router.get('/export/csv', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { startDate, endDate, childId, groupId } = req.query;
    
    let reports = readReports().filter(r => !r.isDeleted);
    const children = readChildren();
    
    // Filter by date range
    if (startDate && isValidDate(startDate)) {
      reports = reports.filter(r => r.date >= startDate);
    }
    if (endDate && isValidDate(endDate)) {
      reports = reports.filter(r => r.date <= endDate);
    }
    if (childId) {
      reports = reports.filter(r => r.childId === childId);
    }
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c.id);
      reports = reports.filter(r => groupChildIds.includes(r.childId));
    }
    
    // Generate CSV
    const headers = ['Date', 'Child Name', 'Arrival Time', 'Departure Time', 'Sleep Duration', 'Behavior', 'Teacher Notes'];
    const rows = reports.map(r => {
      const child = children.find(c => c.id === r.childId);
      return [
        r.date,
        child ? `${child.firstName} ${child.lastName}` : 'Unknown',
        r.arrival?.time || '',
        r.departure?.time || '',
        r.sleep?.duration || 0,
        r.behavior?.overall || '',
        (r.teacherNotes || '').replace(/"/g, '""')
      ].map(v => `"${v}"`).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=daily-reports-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    logger.error('Export CSV error', { error: error.message });
    res.status(500).json({ error: 'Failed to export reports' });
  }
});

function formatReportForTelegram(report, child) {
  const mealStatus = { full: '✅ To\'liq yedi', partial: '🟡 Qisman yedi', none: '❌ Yemadi' };
  const moodEmoji = { happy: '😊', calm: '😌', sad: '😢', angry: '😠', tired: '😴', neutral: '😐', excited: '🤩' };
  const conditionEmoji = { good: '👍', sick: '🤒', tired: '😴', upset: '😢' };
  
  let message = `📋 *KUNLIK HISOBOT*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `👶 *${sanitizeText(child.firstName)} ${sanitizeText(child.lastName)}*\n`;
  message += `📅 ${report.date}\n\n`;
  
  // Kelish/Ketish
  if (report.arrival?.time) {
    message += `🚶 *Kelish:*\n`;
    message += `• Soat: ${report.arrival.time}\n`;
    if (report.arrival.broughtByName) {
      message += `• Olib keldi: ${sanitizeText(report.arrival.broughtByName)}`;
      if (report.arrival.broughtByRelation) message += ` (${sanitizeText(report.arrival.broughtByRelation)})`;
      message += `\n`;
    }
    message += `• Holati: ${conditionEmoji[report.arrival.condition] || '👍'}\n`;
    if (report.arrival.notes) message += `• Izoh: ${sanitizeText(report.arrival.notes)}\n`;
    message += `\n`;
  }
  
  if (report.departure?.time) {
    message += `🏠 *Ketish:*\n`;
    message += `• Soat: ${report.departure.time}\n`;
    if (report.departure.pickedUpByName) {
      message += `• Olib ketdi: ${sanitizeText(report.departure.pickedUpByName)}`;
      if (report.departure.pickedUpByRelation) message += ` (${sanitizeText(report.departure.pickedUpByRelation)})`;
      message += `\n`;
    }
    message += `• Holati: ${conditionEmoji[report.departure.condition] || '👍'}\n`;
    if (report.departure.notes) message += `• Izoh: ${sanitizeText(report.departure.notes)}\n`;
    message += `\n`;
  }
  
  // Ovqatlanish
  message += `🍽 *Ovqatlanish:*\n`;
  
  const mealNames = { breakfast: 'Nonushta', lunch: 'Tushlik', snack: 'Poldnik' };
  
  for (const [mealType, mealName] of Object.entries(mealNames)) {
    const meal = report.meals?.[mealType];
    if (meal) {
      message += `\n*${mealName}:*\n`;
      
      if (meal.items && meal.items.length > 0) {
        meal.items.forEach(item => {
          const status = meal.eaten?.[item] || 'none';
          message += `  • ${sanitizeText(item)}: ${mealStatus[status] || '❓'}\n`;
        });
      } else if (meal.eaten && Object.keys(meal.eaten).length > 0) {
        Object.entries(meal.eaten).forEach(([item, status]) => {
          message += `  • ${sanitizeText(item)}: ${mealStatus[status] || '❓'}\n`;
        });
      }
      
      if (meal.appetite) {
        const appetiteText = { good: '👍 Yaxshi', normal: '👌 O\'rtacha', poor: '👎 Yomon' };
        message += `  Ishtaha: ${appetiteText[meal.appetite] || meal.appetite}\n`;
      }
      
      if (meal.notes) message += `  📝 ${sanitizeText(meal.notes)}\n`;
    }
  }
  message += `\n`;
  
  // Uyqu
  message += `💤 *Uyqu:*\n`;
  if (report.sleep?.slept) {
    if (report.sleep.startTime && report.sleep.endTime) {
      message += `• ${report.sleep.startTime} - ${report.sleep.endTime}`;
    }
    if (report.sleep.duration) {
      message += ` (${report.sleep.duration} daqiqa)`;
    }
    message += `\n`;
    
    const qualityText = { good: '👍 Yaxshi', normal: '👌 O\'rtacha', restless: '😟 Bezovta', none: '❌' };
    message += `• Sifati: ${qualityText[report.sleep.quality] || report.sleep.quality}\n`;
    
    if (!report.sleep.fellAsleepEasily) message += `• ⚠️ Qiyin uxladi\n`;
    if (report.sleep.wokeUpDuring) message += `• ⚠️ Uyqu orasida uyg'ondi\n`;
  } else {
    message += `• Uxlamadi\n`;
  }
  if (report.sleep?.notes) message += `• ${sanitizeText(report.sleep.notes)}\n`;
  message += `\n`;
  
  // Kayfiyat
  message += `😊 *Kayfiyat:*\n`;
  const timeNames = { morning: 'Ertalab', midday: 'Kun o\'rtasi', afternoon: 'Tushdan keyin', evening: 'Kechqurun' };
  for (const [time, name] of Object.entries(timeNames)) {
    const m = report.mood?.[time];
    if (m) {
      const moodValue = typeof m === 'string' ? m : m.mood;
      message += `• ${name}: ${moodEmoji[moodValue] || moodValue || '😐'}`;
      if (m.notes) message += ` - ${sanitizeText(m.notes)}`;
      message += `\n`;
    }
  }
  message += `\n`;
  
  // Faoliyatlar
  if (report.activities && report.activities.length > 0) {
    message += `🎨 *Faoliyatlar:*\n`;
    const actEmoji = { art: '🎨', play: '🎮', learning: '📚', music: '🎵', sport: '⚽', outdoor: '🌳', social: '👫', other: '📌' };
    report.activities.forEach(act => {
      message += `• ${actEmoji[act.type] || '📌'} ${sanitizeText(act.description) || act.type}\n`;
      if (act.notes) message += `  ${sanitizeText(act.notes)}\n`;
    });
    message += `\n`;
  }
  
  // Xulq-atvor
  if (report.behavior) {
    message += `⭐ *Xulq-atvor:*\n`;
    const behaviorText = { excellent: '🌟 A\'lo', good: '👍 Yaxshi', fair: '👌 O\'rtacha', challenging: '⚠️ Qiyin' };
    message += `• Umumiy: ${behaviorText[report.behavior.overall] || report.behavior.overall}\n`;
    
    if (report.behavior.positive_moments?.length > 0) {
      message += `• ✨ Ijobiy: ${report.behavior.positive_moments.map(sanitizeText).join(', ')}\n`;
    }
    if (report.behavior.incidents?.length > 0) {
      message += `• ⚠️ Voqealar: ${report.behavior.incidents.map(sanitizeText).join(', ')}\n`;
    }
    message += `\n`;
  }
  
  // Sog'liq
  if (report.health?.temperature || report.health?.symptoms?.length > 0 || report.health?.notes) {
    message += `🏥 *Sog'liq:*\n`;
    if (report.health.temperature) message += `• Harorat: ${report.health.temperature}°C\n`;
    if (report.health.symptoms?.length > 0) {
      const symptomNames = { cough: 'yo\'tal', runny_nose: 'burun oqishi', fever: 'isitma', rash: 'toshma', vomiting: 'qusish', diarrhea: 'ich ketish' };
      message += `• Belgilar: ${report.health.symptoms.map(s => symptomNames[s] || s).join(', ')}\n`;
    }
    if (report.health.notes) message += `• ${sanitizeText(report.health.notes)}\n`;
    message += `\n`;
  }
  
  // Tarbiyachi izohi
  if (report.teacherNotes) {
    message += `📝 *Tarbiyachi izohi:*\n`;
    message += `${sanitizeText(report.teacherNotes)}\n\n`;
  }
  
  // Ota-ona uchun eslatma
  if (report.parentNotes) {
    message += `💡 *Ota-ona uchun:*\n`;
    message += `${sanitizeText(report.parentNotes)}\n\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `_Play Kids Bog'cha_ 🏫\n`;
  message += `_${new Date().toLocaleString('uz-UZ')}_`;
  
  return message;
}

export default router;
