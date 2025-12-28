import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { io } from 'socket.io-client'

const WebSocketContext = createContext(null)

const RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000
const RECONNECT_MULTIPLIER = 1.5

// WebSocket URL ni aniqlash
const getWebSocketUrl = () => {
  // Production da wss:// ishlatish
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }
  // Development da localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  // Production da joriy host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}`
}

export function WebSocketProvider({ children, url = getWebSocketUrl() }) {
  const socketRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef(null)
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  
  const listeners = useRef(new Map())

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    setConnectionStatus('connecting')
    setError(null)

    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: false, // We handle reconnection manually
      timeout: 10000,
      auth: {
        token: localStorage.getItem('token')
      }
    })

    socketRef.current.on('connect', () => {
      setConnectionStatus('connected')
      reconnectAttempts.current = 0
      console.log('WebSocket connected')
    })

    socketRef.current.on('disconnect', (reason) => {
      setConnectionStatus('disconnected')
      console.log('WebSocket disconnected:', reason)
      
      if (reason !== 'io client disconnect') {
        scheduleReconnect()
      }
    })

    socketRef.current.on('connect_error', (err) => {
      setError(err.message)
      setConnectionStatus('error')
      console.error('WebSocket connection error:', err)
      scheduleReconnect()
    })

    // Generic message handler
    socketRef.current.onAny((event, data) => {
      setLastMessage({ event, data, timestamp: Date.now() })
      
      // Notify all listeners for this event
      const eventListeners = listeners.current.get(event)
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data))
      }
    })
  }, [url])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }

    const delay = Math.min(
      RECONNECT_DELAY * Math.pow(RECONNECT_MULTIPLIER, reconnectAttempts.current),
      MAX_RECONNECT_DELAY
    )

    reconnectTimeout.current = setTimeout(() => {
      reconnectAttempts.current++
      connect()
    }, delay)
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setConnectionStatus('disconnected')
  }, [])

  const emit = useCallback((event, data, callback) => {
    if (socketRef.current?.connected) {
      if (callback) {
        socketRef.current.emit(event, data, callback)
      } else {
        socketRef.current.emit(event, data)
      }
      return true
    }
    return false
  }, [])

  const subscribe = useCallback((event, callback) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set())
    }
    listeners.current.get(event).add(callback)

    // Return unsubscribe function
    return () => {
      const eventListeners = listeners.current.get(event)
      if (eventListeners) {
        eventListeners.delete(callback)
        if (eventListeners.size === 0) {
          listeners.current.delete(event)
        }
      }
    }
  }, [])

  const emitWithAck = useCallback((event, data, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'))
        return
      }

      const timer = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, timeout)

      socketRef.current.emit(event, data, (response) => {
        clearTimeout(timer)
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const value = {
    socket: socketRef.current,
    connectionStatus,
    lastMessage,
    error,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    emit,
    subscribe,
    emitWithAck,
    reconnectAttempts: reconnectAttempts.current
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
  url: PropTypes.string
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Hook for subscribing to specific events
export function useSocketEvent(event, callback) {
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    if (!event || !callback) return
    return subscribe(event, callback)
  }, [event, callback, subscribe])
}

// Hook for real-time data sync
export function useRealtimeData(entityType, initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const { subscribe, emit, isConnected } = useWebSocket()

  useEffect(() => {
    if (!isConnected) return

    // Subscribe to entity updates
    const unsubCreate = subscribe(`${entityType}:created`, (newItem) => {
      setData(prev => Array.isArray(prev) ? [...prev, newItem] : newItem)
    })

    const unsubUpdate = subscribe(`${entityType}:updated`, (updatedItem) => {
      setData(prev => {
        if (Array.isArray(prev)) {
          return prev.map(item => item.id === updatedItem.id ? updatedItem : item)
        }
        return prev?.id === updatedItem.id ? updatedItem : prev
      })
    })

    const unsubDelete = subscribe(`${entityType}:deleted`, (deletedId) => {
      setData(prev => {
        if (Array.isArray(prev)) {
          return prev.filter(item => item.id !== deletedId)
        }
        return prev?.id === deletedId ? null : prev
      })
    })

    // Request initial data
    setLoading(true)
    emit(`${entityType}:subscribe`, {}, (response) => {
      if (response?.data) {
        setData(response.data)
      }
      setLoading(false)
    })

    return () => {
      unsubCreate()
      unsubUpdate()
      unsubDelete()
      emit(`${entityType}:unsubscribe`)
    }
  }, [entityType, subscribe, emit, isConnected])

  const optimisticUpdate = useCallback((updateFn) => {
    setData(prev => updateFn(prev))
  }, [])

  return { data, loading, optimisticUpdate, isConnected }
}

export default WebSocketContext
