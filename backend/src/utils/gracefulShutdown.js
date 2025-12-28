/**
 * Graceful Shutdown Handler
 * Properly closes connections and cleans up resources
 */

import logger from './logger.js'

class GracefulShutdown {
  constructor() {
    this.isShuttingDown = false
    this.connections = new Set()
    this.cleanupHandlers = []
  }

  /**
   * Track active connections
   */
  trackConnection(connection) {
    this.connections.add(connection)
    
    connection.on('close', () => {
      this.connections.delete(connection)
    })
  }

  /**
   * Register cleanup handler
   */
  registerCleanup(handler) {
    this.cleanupHandlers.push(handler)
  }

  /**
   * Perform graceful shutdown
   */
  async shutdown(signal, server) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress')
      return
    }

    this.isShuttingDown = true
    logger.info(`${signal} received, starting graceful shutdown...`)

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed')
    })

    // Set timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30000) // 30 seconds

    try {
      // Close all active connections
      logger.info(`Closing ${this.connections.size} active connections...`)
      for (const connection of this.connections) {
        connection.destroy()
      }

      // Run cleanup handlers
      logger.info('Running cleanup handlers...')
      await Promise.all(
        this.cleanupHandlers.map(async (handler) => {
          try {
            await handler()
          } catch (error) {
            logger.error('Cleanup handler error:', error)
          }
        })
      )

      clearTimeout(forceShutdownTimeout)
      logger.info('Graceful shutdown completed')
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      clearTimeout(forceShutdownTimeout)
      process.exit(1)
    }
  }

  /**
   * Setup signal handlers
   */
  setupHandlers(server) {
    // Track connections
    server.on('connection', (connection) => {
      this.trackConnection(connection)
    })

    // Handle shutdown signals
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']
    
    signals.forEach((signal) => {
      process.on(signal, () => {
        this.shutdown(signal, server)
      })
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      this.shutdown('uncaughtException', server)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      this.shutdown('unhandledRejection', server)
    })

    logger.info('Graceful shutdown handlers registered')
  }
}

// Export singleton instance
const gracefulShutdown = new GracefulShutdown()
export default gracefulShutdown

export const setupGracefulShutdown = (server) => {
  gracefulShutdown.setupHandlers(server)
}

export const registerCleanup = (handler) => {
  gracefulShutdown.registerCleanup(handler)
}
