// 🧠 1. MEMORY-BASED UI - Sayt foydalanuvchini "eslaydi"
import { createContext, useContext, useEffect, useState } from 'react'
import secureStorage from '../../utils/secureStorage'

const MemoryContext = createContext()

// Section visit tracking
const STORAGE_KEY = 'playkids_user_memory'

const getMemory = () => {
  try {
    const data = secureStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { visits: {}, lastVisit: null, totalVisits: 0 }
  } catch (error) {
    console.error('Error loading memory:', error)
    return { visits: {}, lastVisit: null, totalVisits: 0 }
  }
}

const saveMemory = (memory) => {
  try {
    secureStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
  } catch (error) {
    console.error('Error saving memory:', error)
    // Silently fail if storage is not available
  }
}

export const MemoryProvider = ({ children }) => {
  const [memory, setMemory] = useState(getMemory)

  // Track section visit
  const trackVisit = (sectionId) => {
    setMemory(prev => {
      const newMemory = {
        ...prev,
        visits: {
          ...prev.visits,
          [sectionId]: (prev.visits[sectionId] || 0) + 1
        },
        lastVisit: Date.now(),
        totalVisits: prev.totalVisits + 1
      }
      saveMemory(newMemory)
      return newMemory
    })
  }

  // Get animation delay based on visit frequency
  const getAnimationDelay = (sectionId) => {
    const visits = memory.visits[sectionId] || 0
    // More visits = faster animation (user is familiar)
    // Less visits = slower, more noticeable animation
    if (visits > 10) return 0.1 // Very familiar
    if (visits > 5) return 0.2  // Familiar
    if (visits > 2) return 0.3  // Getting familiar
    return 0.5 // New section - slower, more attention
  }

  // Get animation intensity based on familiarity
  const getAnimationIntensity = (sectionId) => {
    const visits = memory.visits[sectionId] || 0
    if (visits > 10) return 'subtle'
    if (visits > 5) return 'normal'
    return 'prominent'
  }

  // Check if user is returning
  const isReturningUser = memory.totalVisits > 1

  // Get most visited sections
  const getMostVisited = () => {
    return Object.entries(memory.visits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)
  }

  return (
    <MemoryContext.Provider value={{
      memory,
      trackVisit,
      getAnimationDelay,
      getAnimationIntensity,
      isReturningUser,
      getMostVisited
    }}>
      {children}
    </MemoryContext.Provider>
  )
}

export const useMemory = () => {
  const context = useContext(MemoryContext)
  if (!context) {
    return {
      trackVisit: () => {},
      getAnimationDelay: () => 0.3,
      getAnimationIntensity: () => 'normal',
      isReturningUser: false,
      getMostVisited: () => []
    }
  }
  return context
}
