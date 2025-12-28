/**
 * Migration Registry
 * Registers all migrations in order
 */

import migrationRunner from './migrationRunner.js'
import migration001 from './001_initial_schema.js'
import migration002 from './002_add_user_roles.js'
import migration003 from './003_add_timestamps.js'

// Register migrations in order
migrationRunner.register(migration001)
migrationRunner.register(migration002)
migrationRunner.register(migration003)

export default migrationRunner
