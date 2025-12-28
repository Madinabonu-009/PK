import axios from 'axios';
import { logger } from '../utils/logger.js';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    logger.error('API xatolik:', error.response?.data || error.message);
    throw error;
  }
);

// ============ MENU ============
export const getMenu = async () => {
  return await api.get('/menu');
};

export const getTodayMenu = async () => {
  const menu = await getMenu();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return { day: today, menu: menu[today] };
};

// ============ CHILDREN ============
export const getChildren = async () => {
  return await api.get('/children');
};

export const getChildById = async (id) => {
  return await api.get(`/children/${id}`);
};

export const getChildrenByParentPhone = async (phone) => {
  const children = await getChildren();
  return children.filter(c => c.parentPhone === phone);
};

// ============ GROUPS ============
export const getGroups = async () => {
  return await api.get('/groups');
};

export const getGroupById = async (id) => {
  return await api.get(`/groups/${id}`);
};

// ============ ATTENDANCE ============
export const getAttendance = async () => {
  return await api.get('/attendance');
};

export const getAttendanceByChild = async (childId) => {
  const attendance = await getAttendance();
  return attendance.filter(a => a.childId === childId);
};

export const markAttendance = async (childId, status, note = '') => {
  return await api.post('/attendance', { childId, status, note });
};

// ============ DAILY REPORTS ============
export const getDailyReports = async () => {
  return await api.get('/daily-reports');
};

export const getReportsByChild = async (childId) => {
  const reports = await getDailyReports();
  return reports.filter(r => r.childId === childId);
};

export const createDailyReport = async (reportData) => {
  return await api.post('/daily-reports', reportData);
};

// ============ PAYMENTS ============
export const getPayments = async () => {
  return await api.get('/payments');
};

export const getPaymentsByChild = async (childId) => {
  const payments = await getPayments();
  return payments.filter(p => p.childId === childId);
};

// ============ DEBTS ============
export const getDebts = async () => {
  return await api.get('/debts');
};

export const getDebtsByChild = async (childId) => {
  const debts = await getDebts();
  return debts.filter(d => d.childId === childId);
};

// ============ ENROLLMENTS ============
export const getEnrollments = async () => {
  return await api.get('/enrollments');
};

export const getPendingEnrollments = async () => {
  const enrollments = await getEnrollments();
  return enrollments.filter(e => e.status === 'pending');
};

// ============ STATISTICS ============
export const getStatistics = async () => {
  const [children, groups, enrollments, payments] = await Promise.all([
    getChildren(),
    getGroups(),
    getEnrollments(),
    getPayments()
  ]);
  
  return {
    totalChildren: children.length,
    totalGroups: groups.length,
    pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
    totalPayments: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  };
};

export default {
  getMenu,
  getTodayMenu,
  getChildren,
  getChildById,
  getChildrenByParentPhone,
  getGroups,
  getGroupById,
  getAttendance,
  getAttendanceByChild,
  markAttendance,
  getDailyReports,
  getReportsByChild,
  createDailyReport,
  getPayments,
  getPaymentsByChild,
  getDebts,
  getDebtsByChild,
  getEnrollments,
  getPendingEnrollments,
  getStatistics
};
