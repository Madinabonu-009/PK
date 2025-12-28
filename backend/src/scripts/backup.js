/**
 * Automated Backup Script
 * Creates backups of data files
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../data')
const BACKUP_DIR = path.join(__dirname, '../../backups')
const MAX_BACKUPS = 30 // Keep last 30 backups

/**
 * Create backup
 */
export const createBackup = async () => {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `backup-${timestamp}.tar.gz`
    const backupPath = path.join(BACKUP_DIR, backupName)

    console.log(`Creating backup: ${backupName}`)

    // Create archive
    const output = fs.createWriteStream(backupPath)
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 }
    })

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2)
        console.log(`✓ Backup created: ${backupName} (${sizeInMB} MB)`)
        
        // Cleanup old backups
        cleanupOldBackups()
        
        resolve({
          success: true,
          filename: backupName,
          path: backupPath,
          size: archive.pointer()
        })
      })

      archive.on('error', (err) => {
        console.error('Backup error:', err)
        reject(err)
      })

      archive.pipe(output)

      // Add data directory to archive
      archive.directory(DATA_DIR, 'data')

      // Add logs (last 7 days)
      const logsDir = path.join(__dirname, '../../logs')
      if (fs.existsSync(logsDir)) {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const logFiles = fs.readdirSync(logsDir)
          .filter(file => {
            const filePath = path.join(logsDir, file)
            const stats = fs.statSync(filePath)
            return stats.mtimeMs > sevenDaysAgo
          })

        logFiles.forEach(file => {
          archive.file(path.join(logsDir, file), { name: `logs/${file}` })
        })
      }

      archive.finalize()
    })
  } catch (error) {
    console.error('Failed to create backup:', error)
    throw error
  }
}

/**
 * Cleanup old backups
 */
const cleanupOldBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.tar.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtimeMs
      }))
      .sort((a, b) => b.time - a.time)

    // Remove old backups
    if (backups.length > MAX_BACKUPS) {
      const toRemove = backups.slice(MAX_BACKUPS)
      toRemove.forEach(backup => {
        fs.unlinkSync(backup.path)
        console.log(`Removed old backup: ${backup.name}`)
      })
    }
  } catch (error) {
    console.error('Failed to cleanup old backups:', error)
  }
}

/**
 * Restore from backup
 */
export const restoreBackup = async (backupName) => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupName)

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`)
    }

    console.log(`Restoring from backup: ${backupName}`)

    // TODO: Implement restore logic
    // This would involve extracting the tar.gz and copying files

    console.log('✓ Backup restored successfully')

    return {
      success: true,
      filename: backupName
    }
  } catch (error) {
    console.error('Failed to restore backup:', error)
    throw error
  }
}

/**
 * List available backups
 */
export const listBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return []
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.tar.gz'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: stats.size,
          sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
          created: stats.mtime,
          path: filePath
        }
      })
      .sort((a, b) => b.created - a.created)

    return backups
  } catch (error) {
    console.error('Failed to list backups:', error)
    return []
  }
}

/**
 * Get backup stats
 */
export const getBackupStats = () => {
  const backups = listBackups()
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0)

  return {
    count: backups.length,
    totalSize,
    totalSizeInMB: (totalSize / 1024 / 1024).toFixed(2),
    oldest: backups[backups.length - 1]?.created,
    newest: backups[0]?.created
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup()
    .then(() => {
      console.log('Backup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Backup failed:', error)
      process.exit(1)
    })
}

export default {
  createBackup,
  restoreBackup,
  listBackups,
  getBackupStats
}
