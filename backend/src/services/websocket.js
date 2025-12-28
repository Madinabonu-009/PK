/**
 * WebSocket Service
 * Real-time communication using Socket.IO
 */

import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'play-kids-secret-key'

class WebSocketService {
  constructor() {
    this.io = null
    this.connectedUsers = new Map()
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        socket.userId = decoded.id
        socket.userRole = decoded.role
        next()
      } catch (error) {
        next(new Error('Invalid token'))
      }
    })

    // Connection handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket)
    })

    logger.info('WebSocket server initialized')
  }

  /**
   * Handle new connection
   */
  handleConnection(socket) {
    const userId = socket.userId
    const userRole = socket.userRole

    logger.info(`User connected: ${userId} (${userRole})`)

    // Store connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      role: userRole,
      connectedAt: new Date()
    })

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Join role-specific room
    socket.join(`role:${userRole}`)

    // Send connection confirmation
    socket.emit('connected', {
      userId,
      role: userRole,
      timestamp: new Date().toISOString()
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`)
      this.connectedUsers.delete(userId)
    })

    // Handle custom events
    this.setupEventHandlers(socket)
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers(socket) {
    const userId = socket.userId

    // Join specific rooms
    socket.on('join:group', (groupId) => {
      socket.join(`group:${groupId}`)
      logger.info(`User ${userId} joined group ${groupId}`)
    })

    socket.on('leave:group', (groupId) => {
      socket.leave(`group:${groupId}`)
      logger.info(`User ${userId} left group ${groupId}`)
    })

    // Chat messages
    socket.on('chat:message', (data) => {
      this.handleChatMessage(socket, data)
    })

    // Typing indicator
    socket.on('chat:typing', (data) => {
      socket.to(`group:${data.groupId}`).emit('chat:typing', {
        userId,
        groupId: data.groupId
      })
    })

    // Presence
    socket.on('presence:update', (status) => {
      this.io.to(`user:${userId}`).emit('presence:changed', {
        userId,
        status,
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * Handle chat message
   */
  handleChatMessage(socket, data) {
    const { groupId, message } = data
    const userId = socket.userId

    // Broadcast to group
    this.io.to(`group:${groupId}`).emit('chat:message', {
      id: `msg_${Date.now()}`,
      userId,
      groupId,
      message,
      timestamp: new Date().toISOString()
    })

    logger.info(`Chat message from ${userId} to group ${groupId}`)
  }

  /**
   * Send notification to user
   */
  sendToUser(userId, event, data) {
    if (!this.io) return

    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send notification to role
   */
  sendToRole(role, event, data) {
    if (!this.io) return

    this.io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send notification to group
   */
  sendToGroup(groupId, event, data) {
    if (!this.io) return

    this.io.to(`group:${groupId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event, data) {
    if (!this.io) return

    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size
  }

  /**
   * Get connected users
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }))
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId)
  }
}

// Export singleton
const websocketService = new WebSocketService()
export default websocketService

// Convenience exports
export const initializeWebSocket = (server) => websocketService.initialize(server)
export const sendToUser = (userId, event, data) => websocketService.sendToUser(userId, event, data)
export const sendToRole = (role, event, data) => websocketService.sendToRole(role, event, data)
export const sendToGroup = (groupId, event, data) => websocketService.sendToGroup(groupId, event, data)
export const broadcast = (event, data) => websocketService.broadcast(event, data)
