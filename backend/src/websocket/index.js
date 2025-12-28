/**
 * WebSocket Server
 * Real-time communication
 */

import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'

class WebSocketManager {
  constructor() {
    this.wss = null
    this.clients = new Map() // userId -> Set of ws connections
    this.rooms = new Map() // roomId -> Set of userIds
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws, req) => {
      console.log('[WS] New connection')
      
      let userId = null
      let isAuthenticated = false

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data)
          this.handleMessage(ws, message, userId)
          
          // Handle authentication
          if (message.type === 'auth') {
            const result = this.authenticate(message.data.token)
            if (result) {
              userId = result.userId
              isAuthenticated = true
              this.addClient(userId, ws)
              this.send(ws, 'auth_success', { userId })
            } else {
              this.send(ws, 'auth_failed', { error: 'Invalid token' })
            }
          }
        } catch (error) {
          console.error('[WS] Message error:', error)
        }
      })

      ws.on('close', () => {
        console.log('[WS] Connection closed')
        if (userId) {
          this.removeClient(userId, ws)
          this.broadcastPresence()
        }
      })

      ws.on('error', (error) => {
        console.error('[WS] Error:', error)
      })

      // Send welcome message
      this.send(ws, 'welcome', { message: 'Connected to Play Kids' })
    })

    console.log('[WS] WebSocket server initialized')
  }

  authenticate(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      return { userId: decoded.id || decoded.userId }
    } catch {
      return null
    }
  }

  addClient(userId, ws) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId).add(ws)
    this.broadcastPresence()
  }

  removeClient(userId, ws) {
    const userConnections = this.clients.get(userId)
    if (userConnections) {
      userConnections.delete(ws)
      if (userConnections.size === 0) {
        this.clients.delete(userId)
      }
    }
  }

  handleMessage(ws, message, userId) {
    const { type, data } = message

    switch (type) {
      case 'join_room':
        this.joinRoom(userId, data.roomId)
        break
        
      case 'leave_room':
        this.leaveRoom(userId, data.roomId)
        break
        
      case 'chat_message':
        this.handleChatMessage(userId, data)
        break
        
      case 'typing':
        this.handleTyping(userId, data)
        break
        
      case 'presence':
        this.handlePresence(userId, data)
        break
        
      case 'ping':
        this.send(ws, 'pong', { timestamp: Date.now() })
        break
    }
  }

  joinRoom(userId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId).add(userId)
    
    this.broadcastToRoom(roomId, 'user_joined', { userId, roomId })
  }

  leaveRoom(userId, roomId) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.delete(userId)
      if (room.size === 0) {
        this.rooms.delete(roomId)
      }
    }
    
    this.broadcastToRoom(roomId, 'user_left', { userId, roomId })
  }

  handleChatMessage(userId, data) {
    const { roomId, message } = data
    
    this.broadcastToRoom(roomId, 'chat_message', {
      roomId,
      userId,
      message,
      timestamp: new Date()
    })
  }

  handleTyping(userId, data) {
    const { roomId, isTyping } = data
    
    this.broadcastToRoom(roomId, 'typing', {
      roomId,
      userId,
      isTyping
    }, userId) // Exclude sender
  }

  handlePresence(userId, data) {
    // Store presence status
    this.broadcastPresence()
  }

  broadcastPresence() {
    const onlineUsers = Array.from(this.clients.keys())
    this.broadcast('presence_update', { users: onlineUsers })
  }

  // Send to specific client
  send(ws, type, data) {
    if (ws.readyState === 1) { // OPEN
      ws.send(JSON.stringify({ type, data, timestamp: Date.now() }))
    }
  }

  // Send to specific user (all their connections)
  sendToUser(userId, type, data) {
    const connections = this.clients.get(userId)
    if (connections) {
      connections.forEach(ws => this.send(ws, type, data))
    }
  }

  // Broadcast to all connected clients
  broadcast(type, data, excludeUserId = null) {
    this.clients.forEach((connections, userId) => {
      if (userId !== excludeUserId) {
        connections.forEach(ws => this.send(ws, type, data))
      }
    })
  }

  // Broadcast to room
  broadcastToRoom(roomId, type, data, excludeUserId = null) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.forEach(userId => {
        if (userId !== excludeUserId) {
          this.sendToUser(userId, type, data)
        }
      })
    }
  }

  // Send notification
  sendNotification(userId, notification) {
    this.sendToUser(userId, 'notification', notification)
  }

  // Broadcast notification to multiple users
  broadcastNotification(userIds, notification) {
    userIds.forEach(userId => {
      this.sendNotification(userId, notification)
    })
  }
}

const wsManager = new WebSocketManager()

export default wsManager
