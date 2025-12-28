import { useState, useEffect, useCallback, useRef } from 'react'

const DB_NAME = 'PlayKidsOffline'
const DB_VERSION = 1

export function useOfflineQueue(storeName = 'pendingActions') {
  const [queue, setQueue] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const dbRef = useRef(null)

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Failed to open IndexedDB')
    }

    request.onsuccess = () => {
      dbRef.current = request.result
      loadQueue()
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('pendingAttendance')) {
        db.createObjectStore('pendingAttendance', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true })
      }
    }

    return () => {
      dbRef.current?.close()
    }
  }, [])

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    if (!dbRef.current) return

    try {
      const tx = dbRef.current.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        setQueue(request.result || [])
      }
    } catch (error) {
      console.error('Failed to load queue:', error)
    }
  }, [storeName])

  const addToQueue = useCallback(async (action) => {
    if (!dbRef.current) return null

    const item = {
      ...action,
      timestamp: Date.now(),
      retries: 0
    }

    return new Promise((resolve, reject) => {
      const tx = dbRef.current.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.add(item)

      request.onsuccess = () => {
        item.id = request.result
        setQueue(prev => [...prev, item])
        resolve(item)
      }

      request.onerror = () => reject(request.error)
    })
  }, [storeName])

  const removeFromQueue = useCallback(async (id) => {
    if (!dbRef.current) return

    return new Promise((resolve, reject) => {
      const tx = dbRef.current.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        setQueue(prev => prev.filter(item => item.id !== id))
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }, [storeName])

  const syncQueue = useCallback(async () => {
    if (!isOnline || syncing || queue.length === 0) return

    setSyncing(true)

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...item.headers
          },
          body: JSON.stringify(item.data)
        })

        if (response.ok) {
          await removeFromQueue(item.id)
        } else if (item.retries < 3) {
          // Update retry count
          const tx = dbRef.current.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          store.put({ ...item, retries: item.retries + 1 })
        } else {
          // Max retries reached, remove from queue
          await removeFromQueue(item.id)
          console.error('Max retries reached for action:', item)
        }
      } catch (error) {
        console.error('Sync failed for item:', item, error)
      }
    }

    setSyncing(false)
  }, [isOnline, syncing, queue, removeFromQueue, storeName])

  const clearQueue = useCallback(async () => {
    if (!dbRef.current) return

    return new Promise((resolve, reject) => {
      const tx = dbRef.current.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        setQueue([])
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }, [storeName])

  // Request background sync if available
  const requestBackgroundSync = useCallback(async (tag = 'sync-actions') => {
    if ('serviceWorker' in navigator && 'sync' in window.SyncManager) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
    }
  }, [])

  return {
    queue,
    syncing,
    isOnline,
    addToQueue,
    removeFromQueue,
    syncQueue,
    clearQueue,
    requestBackgroundSync,
    queueLength: queue.length
  }
}

export default useOfflineQueue
