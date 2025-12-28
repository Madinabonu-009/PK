/**
 * Database Migration Runner
 * Manages schema changes and data migrations
 */

import { readData, writeData } from '../utils/db.js'
import logger from '../utils/logger.js'

const MIGRATION_HISTORY_FILE = 'migrations.json'

class MigrationRunner {
  constructor() {
    this.migrations = []
    this.history = this.loadHistory()
  }

  /**
   * Load migration history
   */
  loadHistory() {
    try {
      return readData(MIGRATION_HISTORY_FILE) || []
    } catch (error) {
      return []
    }
  }

  /**
   * Save migration history
   */
  saveHistory() {
    writeData(MIGRATION_HISTORY_FILE, this.history)
  }

  /**
   * Register migration
   */
  register(migration) {
    this.migrations.push(migration)
  }

  /**
   * Get pending migrations
   */
  getPendingMigrations() {
    const executedIds = this.history.map(h => h.id)
    return this.migrations.filter(m => !executedIds.includes(m.id))
  }

  /**
   * Run all pending migrations
   */
  async runPending() {
    const pending = this.getPendingMigrations()

    if (pending.length === 0) {
      logger.info('No pending migrations')
      return { success: true, executed: 0 }
    }

    logger.info(`Running ${pending.length} pending migrations...`)

    const results = []

    for (const migration of pending) {
      try {
        logger.info(`Running migration: ${migration.id} - ${migration.description}`)
        
        const startTime = Date.now()
        await migration.up()
        const duration = Date.now() - startTime

        // Record in history
        this.history.push({
          id: migration.id,
          description: migration.description,
          executedAt: new Date().toISOString(),
          duration
        })

        this.saveHistory()

        results.push({
          id: migration.id,
          success: true,
          duration
        })

        logger.info(`✓ Migration ${migration.id} completed in ${duration}ms`)
      } catch (error) {
        logger.error(`✗ Migration ${migration.id} failed:`, error)
        
        results.push({
          id: migration.id,
          success: false,
          error: error.message
        })

        // Stop on first failure
        break
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return {
      success: failed === 0,
      executed: successful,
      failed,
      results
    }
  }

  /**
   * Rollback last migration
   */
  async rollbackLast() {
    if (this.history.length === 0) {
      logger.info('No migrations to rollback')
      return { success: false, message: 'No migrations to rollback' }
    }

    const lastMigration = this.history[this.history.length - 1]
    const migration = this.migrations.find(m => m.id === lastMigration.id)

    if (!migration) {
      logger.error(`Migration ${lastMigration.id} not found`)
      return { success: false, message: 'Migration not found' }
    }

    if (!migration.down) {
      logger.error(`Migration ${lastMigration.id} has no rollback`)
      return { success: false, message: 'No rollback available' }
    }

    try {
      logger.info(`Rolling back migration: ${migration.id}`)
      
      await migration.down()

      // Remove from history
      this.history.pop()
      this.saveHistory()

      logger.info(`✓ Migration ${migration.id} rolled back`)

      return {
        success: true,
        id: migration.id
      }
    } catch (error) {
      logger.error(`✗ Rollback failed:`, error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get migration status
   */
  getStatus() {
    const executed = this.history.length
    const pending = this.getPendingMigrations().length
    const total = this.migrations.length

    return {
      total,
      executed,
      pending,
      history: this.history,
      pendingMigrations: this.getPendingMigrations().map(m => ({
        id: m.id,
        description: m.description
      }))
    }
  }
}

// Export singleton
const migrationRunner = new MigrationRunner()
export default migrationRunner

// Convenience exports
export const registerMigration = (migration) => migrationRunner.register(migration)
export const runPendingMigrations = () => migrationRunner.runPending()
export const rollbackLastMigration = () => migrationRunner.rollbackLast()
export const getMigrationStatus = () => migrationRunner.getStatus()
