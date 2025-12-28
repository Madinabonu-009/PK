/**
 * Data Backup Utility
 * Provides automatic backup functionality for JSON data files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create backup of a specific data file
 * @param {string} filename - Name of the file to backup
 * @returns {boolean} - Success status
 */
export const backupFile = (filename) => {
  try {
    const sourcePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(sourcePath)) {
      logger.warn(`Backup skipped: ${filename} does not exist`);
      return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${path.basename(filename, '.json')}_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    fs.copyFileSync(sourcePath, backupPath);
    logger.info(`Backup created: ${backupFilename}`);
    return true;
  } catch (error) {
    logger.error(`Backup failed for ${filename}`, { error: error.message });
    return false;
  }
};

/**
 * Create backup of all data files
 * @returns {Object} - Results of backup operation
 */
export const backupAllData = () => {
  const dataFiles = [
    'children.json',
    'groups.json',
    'enrollments.json',
    'dailyReports.json',
    'attendance.json',
    'payments.json',
    'blog.json',
    'events.json',
    'gallery.json',
    'feedback.json',
    'menu.json',
    'users.json'
  ];

  const results = {
    success: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  for (const file of dataFiles) {
    if (backupFile(file)) {
      results.success.push(file);
    } else {
      results.failed.push(file);
    }
  }

  logger.info('Backup completed', {
    success: results.success.length,
    failed: results.failed.length
  });

  return results;
};

/**
 * Clean old backups (keep last N days)
 * @param {number} daysToKeep - Number of days to keep backups
 */
export const cleanOldBackups = (daysToKeep = 7) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info(`Cleaned ${deletedCount} old backup files`);
    }
  } catch (error) {
    logger.error('Failed to clean old backups', { error: error.message });
  }
};

/**
 * Restore data from backup
 * @param {string} backupFilename - Name of backup file to restore
 * @param {string} targetFilename - Target data file name
 * @returns {boolean} - Success status
 */
export const restoreFromBackup = (backupFilename, targetFilename) => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    const targetPath = path.join(DATA_DIR, targetFilename);

    if (!fs.existsSync(backupPath)) {
      logger.error(`Backup file not found: ${backupFilename}`);
      return false;
    }

    // Create backup of current file before restore
    if (fs.existsSync(targetPath)) {
      backupFile(targetFilename);
    }

    fs.copyFileSync(backupPath, targetPath);
    logger.info(`Restored ${targetFilename} from ${backupFilename}`);
    return true;
  } catch (error) {
    logger.error(`Restore failed`, { error: error.message });
    return false;
  }
};

/**
 * List available backups
 * @param {string} dataFile - Optional filter by data file name
 * @returns {Array} - List of backup files
 */
export const listBackups = (dataFile = null) => {
  try {
    let files = fs.readdirSync(BACKUP_DIR);

    if (dataFile) {
      const baseName = path.basename(dataFile, '.json');
      files = files.filter(f => f.startsWith(baseName));
    }

    return files.map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        created: stats.mtime
      };
    }).sort((a, b) => b.created - a.created);
  } catch (error) {
    logger.error('Failed to list backups', { error: error.message });
    return [];
  }
};

/**
 * Get backup statistics
 * @returns {Object} - Backup statistics
 */
export const getBackupStats = () => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    return {
      totalBackups: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      backupDir: BACKUP_DIR
    };
  } catch (error) {
    logger.error('Failed to get backup stats', { error: error.message });
    return null;
  }
};

export default {
  backupFile,
  backupAllData,
  cleanOldBackups,
  restoreFromBackup,
  listBackups,
  getBackupStats
};
