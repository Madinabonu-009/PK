/**
 * WebSocket Hook
 * Real-time communication hook
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import wsService from '../services/websocket'

export function useWebSocket(autoConnect = true) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const unsubscribesRef = useRef([])

  useEffect(() => {
    if (autoConnect) {
      wsService.connect()
    }

    const unsubConnected = wsService.on('connected', () => setIsConnected(true))
    const unsubDisconnected = wsService.on('disconnected', () => setIsConnected(false))
    const unsubAll = wsService.on('*', (msg) => setLastMessage(msg))

    unsubscribesRef.current = [unsubConnected, unsubDisconnected, unsubAll]

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub?.())
    }
  }, [autoConnect])

  const send = useCallback((type, data) => {
    wsService.send(type, data)
  }, [])

  const subscribe = useCallback((type, callback) => {
    return wsService.on(type, callback)
  }, [])

  const connect = useCallback(() => {
    wsService.connect()
  }, [])

  const disconnect = useCallback(() => {
    wsService.disconnect()
  }, [])

  return {
    isConnected,
    lastMessage,
    send,
    subscribe,
    connect,
    disconnect
  }
}

// Chat-specific hook
export function useChat(roomId) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const { isConnected, send, subscribe } = useWebSocket()

  useEffect(() => {
    if (!roomId || !isConnected) return

    // Join room
    wsService.joinRoom(roomId)

    // Subscribe to messages
    const unsubMessage = subscribe('chat_message', (data) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, data])
      }
    })

    // Subscribe to typing
    const unsubTyping = subscribe('typing', (data) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...new Set([...prev, data.userId])]
          }
          return prev.filter(id => id !== data.userId)
        })
      }
    })

    return () => {
      wsService.leaveRoom(roomId)
      unsubMessage?.()
      unsubTyping?.()
    }
  }, [roomId, isConnected, subscribe])

  const sendMessage = useCallback((message) => {
    wsService.sendChatMessage(roomId, message)
  }, [roomId])

  const setTyping = useCallback((isTyping) => {
    wsService.sendTyping(roomId, isTyping)
  }, [roomId])

  return {
    messages,
    typingUsers,
    sendMessage,
    setTyping,
    isConnected
  }
}

// Presence hook
export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const { isConnected, subscribe } = useWebSocket()

  useEffect(() => {
    if (!isConnected) return

    // Update own presence
    wsService.updatePresence('online')

    const unsubPresence = subscribe('presence_update', (data) => {
      setOnlineUsers(data.users || [])
    })

    // Set offline on unmount
    return () => {
      wsService.updatePresence('offline')
      unsubPresence?.()
    }
  }, [isConnected, subscribe])

  const updateStatus = useCallback((status) => {
    wsService.updatePresence(status)
  }, [])

  return {
    onlineUsers,
    updateStatus,
    isConnected
  }
}

export default useWebSocket
