import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Data papkasini yaratish
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Users faylini yaratish
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

// ============ LOCAL DB (JSON) ============
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// ============ USER CRUD ============
export const findUserByTelegramId = (telegramId) => {
  const users = readUsers();
  return users.find(u => u.telegramId === telegramId);
};

export const findUserByPhone = (phone) => {
  const users = readUsers();
  const normalizedPhone = phone.replace(/\D/g, '');
  return users.find(u => u.phone?.replace(/\D/g, '') === normalizedPhone);
};

export const createUser = (userData) => {
  const users = readUsers();
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(newUser);
  writeUsers(users);
  logger.info(`Yangi foydalanuvchi yaratildi: ${newUser.id}`);
  return newUser;
};

export const updateUser = (telegramId, updates) => {
  const users = readUsers();
  const index = users.findIndex(u => u.telegramId === telegramId);
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeUsers(users);
  return users[index];
};

export const getAllUsers = () => {
  return readUsers();
};

// ============ API CALLS ============
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

export const getMenu = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    logger.error('Menu olishda xatolik:', error.message);
    return null;
  }
};

export const getTodayMenu = async () => {
  const menu = await getMenu();
  if (!menu) return null;
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return { day: today, menu: menu[today] };
};

export const getChildByParentPhone = async (phone) => {
  try {
    const response = await api.get('/children');
    const normalizedPhone = phone.replace(/\D/g, '');
    return response.data.find(c => c.parentPhone?.replace(/\D/g, '') === normalizedPhone);
  } catch (error) {
    logger.error('Bola topishda xatolik:', error.message);
    return null;
  }
};

export const getAttendanceByChild = async (childId) => {
  try {
    const response = await api.get('/attendance');
    return response.data.filter(a => a.childId === childId);
  } catch (error) {
    logger.error('Davomat olishda xatolik:', error.message);
    return [];
  }
};

export const getDailyReportByChild = async (childId, date) => {
  try {
    const response = await api.get('/daily-reports');
    return response.data.find(r => r.childId === childId && r.date === date);
  } catch (error) {
    logger.error('Hisobot olishda xatolik:', error.message);
    return null;
  }
};

export const getPaymentsByChild = async (childId) => {
  try {
    const response = await api.get('/payments');
    return response.data.filter(p => p.childId === childId);
  } catch (error) {
    logger.error('To\'lovlar olishda xatolik:', error.message);
    return [];
  }
};

export const getDebtsByChild = async (childId) => {
  try {
    const response = await api.get('/debts');
    return response.data.filter(d => d.childId === childId && d.status === 'pending');
  } catch (error) {
    logger.error('Qarzlar olishda xatolik:', error.message);
    return [];
  }
};

export default {
  findUserByTelegramId,
  findUserByPhone,
  createUser,
  updateUser,
  getAllUsers,
  getMenu,
  getTodayMenu,
  getChildByParentPhone,
  getAttendanceByChild,
  getDailyReportByChild,
  getPaymentsByChild,
  getDebtsByChild
};
