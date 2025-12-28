/**
 * Migration: Add User Roles
 * Adds role field to existing users
 */

import { readData, writeData } from '../utils/db.js'
import logger from '../utils/logger.js'

export default {
  id: '002_add_user_roles',
  description: 'Add role field to users',

  async up() {
    logger.info('Adding role field to users...')

    const users = readData('users.json') || []
    let updated = 0

    const updatedUsers = users.map(user => {
      if (!user.role) {
        updated++
        return {
          ...user,
          role: user.isAdmin ? 'admin' : 'parent'
        }
      }
      return user
    })

    writeData('users.json', updatedUsers)
    logger.info(`Updated ${updated} users with role field`)
  },

  async down() {
    logger.info('Removing role field from users...')

    const users = readData('users.json') || []
    const updatedUsers = users.map(user => {
      const { role, ...rest } = user
      return rest
    })

    writeData('users.json', updatedUsers)
    logger.info('Role field removed from users')
  }
}
