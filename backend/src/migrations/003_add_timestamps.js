/**
 * Migration: Add Timestamps
 * Adds createdAt and updatedAt to all entities
 */

import { readData, writeData } from '../utils/db.js'
import logger from '../utils/logger.js'

export default {
  id: '003_add_timestamps',
  description: 'Add createdAt and updatedAt timestamps',

  async up() {
    logger.info('Adding timestamps to entities...')

    const dataFiles = [
      'children.json',
      'groups.json',
      'enrollments.json',
      'teachers.json',
      'blog.json',
      'events.json',
      'achievements.json',
      'payments.json',
      'feedback.json'
    ]

    let totalUpdated = 0

    for (const file of dataFiles) {
      try {
        const data = readData(file) || []
        let updated = 0

        const updatedData = data.map(item => {
          if (!item.createdAt) {
            updated++
            return {
              ...item,
              createdAt: item.date || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
          return item
        })

        if (updated > 0) {
          writeData(file, updatedData)
          logger.info(`Updated ${updated} records in ${file}`)
          totalUpdated += updated
        }
      } catch (error) {
        logger.warn(`Skipping ${file}: ${error.message}`)
      }
    }

    logger.info(`Total records updated: ${totalUpdated}`)
  },

  async down() {
    logger.info('Removing timestamps from entities...')

    const dataFiles = [
      'children.json',
      'groups.json',
      'enrollments.json',
      'teachers.json',
      'blog.json',
      'events.json',
      'achievements.json',
      'payments.json',
      'feedback.json'
    ]

    for (const file of dataFiles) {
      try {
        const data = readData(file) || []
        const updatedData = data.map(item => {
          const { createdAt, updatedAt, ...rest } = item
          return rest
        })
        writeData(file, updatedData)
      } catch (error) {
        logger.warn(`Skipping ${file}: ${error.message}`)
      }
    }

    logger.info('Timestamps removed')
  }
}
