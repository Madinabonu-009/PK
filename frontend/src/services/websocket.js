/**
 * WebSocket Service
 * Real-time communication
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
    this.messageQueue = []
    this.isConnected = false
  }

  connect(url = null) {
    const wsUrl = url || this.getWebSocketUrl()
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('[WS] Connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift()
          this.send(msg.type, msg.data)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[WS] Parse error:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.code)
        this.isConnected = false
        this.emit('disconnected')
        
        // Reconnect if not intentional close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error)
        this.emit('error', error)
      }
    } catch (error) {
      console.error('[WS] Connection failed:', error)
      this.reconnect()
    }
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.VITE_WS_URL || window.location.host
    return `${protocol}//${host}/ws`
  }

  reconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnect')
      this.ws = null
    }
  }

  send(type, data = {}) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() })
    
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      // Queue message for later
      this.messageQueue.push({ type, data })
    }
  }

  handleMessage(message) {
    const { type, data } = message
    
    // Emit to specific listeners
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(data))
    }
    
    // Emit to 'all' listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => callback(message))
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback)
    }
  }

  off(type, callback) {
    this.listeners.get(type)?.delete(callback)
  }

  emit(type, data = null) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(data))
    }
  }

  // Convenience methods
  joinRoom(roomId) {
    this.send('join_room', { roomId })
  }

  leaveRoom(roomId) {
    this.send('leave_room', { roomId })
  }

  sendChatMessage(roomId, message) {
    this.send('chat_message', { roomId, message })
  }

  sendTyping(roomId, isTyping) {
    this.send('typing', { roomId, isTyping })
  }

  updatePresence(status) {
    this.send('presence', { status })
  }
}

// Singleton instance
const wsService = new WebSocketService()

export default wsService
