/**
 * Migration: Initial Schema Setup
 * Creates initial data structure for the application
 */

import { readData, writeData } from '../utils/db.js'
import logger from '../utils/logger.js'

export default {
  id: '001_initial_schema',
  description: 'Setup initial data structure',

  async up() {
    logger.info('Setting up initial schema...')

    // Ensure all required data files exist
    const dataFiles = [
      'users.json',
      'children.json',
      'groups.json',
      'enrollments.json',
      'teachers.json',
      'menu.json',
      'blog.json',
      'events.json',
      'achievements.json',
      'payments.json',
      'journal.json',
      'feedback.json',
      'attendance.json',
      'dailyReports.json',
      'debts.json',
      'stories.json',
      'progress.json',
      'curriculum.json'
    ]

    for (const file of dataFiles) {
      try {
        readData(file)
      } catch (error) {
        // File doesn't exist, create it
        writeData(file, [])
        logger.info(`Created ${file}`)
      }
    }

    logger.info('Initial schema setup complete')
  },

  async down() {
    logger.info('Rolling back initial schema...')
    // Don't delete data files on rollback
    logger.info('Rollback complete (data preserved)')
  }
}
