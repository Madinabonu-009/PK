// Memory-Based UI - Foydalanuvchini eslab qolish
import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'playkids_user_memory'

// Safe storage helper
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore
    }
  }
}

export const useUserMemory = () => {
  const [memory, setMemory] = useState({
    visitCount: 0,
    lastVisit: null,
    lastPage: '/',
    favoritePages: {},
    totalTime: 0,
    isReturning: false,
    userName: null
  })
  const isMountedRef = useRef(true)

  // Xotirani yuklash
  useEffect(() => {
    isMountedRef.current = true
    
    const loadMemory = () => {
      try {
        const stored = safeStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const now = Date.now()
            const lastVisit = parsed.lastVisit ? new Date(parsed.lastVisit) : null
            const hoursSinceLastVisit = lastVisit 
              ? (now - lastVisit.getTime()) / (1000 * 60 * 60) 
              : 999

            if (isMountedRef.current) {
              setMemory({
                ...parsed,
                visitCount: parsed.visitCount + 1,
                isReturning: hoursSinceLastVisit < 24 * 7, // 1 hafta ichida qaytgan
                lastVisit: now
              })
            }
          } catch (e) {
            initMemory()
          }
        } else {
          initMemory()
        }
      } catch (error) {
        console.error('Error loading user memory:', error)
        initMemory()
      }
    }

    const initMemory = () => {
      const initial = {
        visitCount: 1,
        lastVisit: Date.now(),
        lastPage: '/',
        favoritePages: {},
        totalTime: 0,
        isReturning: false,
        userName: null
      }
      if (isMountedRef.current) {
        setMemory(initial)
      }
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    }

    loadMemory()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Xotirani saqlash
  useEffect(() => {
    if (memory.visitCount > 0 && isMountedRef.current) {
      try {
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
      } catch (error) {
        console.error('Error saving user memory:', error)
      }
    }
  }, [memory])

  // Sahifani eslab qolish
  const rememberPage = useCallback((path) => {
    setMemory(prev => ({
      ...prev,
      lastPage: path,
      favoritePages: {
        ...prev.favoritePages,
        [path]: (prev.favoritePages[path] || 0) + 1
      }
    }))
  }, [])

  // Ismni saqlash
  const rememberName = useCallback((name) => {
    setMemory(prev => ({ ...prev, userName: name }))
  }, [])

  // Eng ko'p kirilgan sahifa
  const getFavoritePage = useCallback(() => {
    const pages = memory.favoritePages
    let maxPage = '/'
    let maxCount = 0
    Object.entries(pages).forEach(([page, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxPage = page
      }
    })
    return maxPage
  }, [memory.favoritePages])

  // Salomlashish xabari
  const getWelcomeMessage = useCallback(() => {
    const { visitCount, isReturning, userName } = memory
    const name = userName ? `, ${userName}` : ''
    
    if (visitCount === 1) {
      return `Xush kelibsiz${name}! 🎉`
    } else if (isReturning) {
      return `Yana ko'rishganimizdan xursandmiz${name}! 💖`
    } else if (visitCount > 10) {
      return `Sizni kutib turgandik${name}! 🌟`
    } else {
      return `Xush kelibsiz${name}! 👋`
    }
  }, [memory])

  return {
    memory,
    rememberPage,
    rememberName,
    getFavoritePage,
    getWelcomeMessage,
    isFirstVisit: memory.visitCount === 1,
    isFrequentVisitor: memory.visitCount > 5
  }
}

export default useUserMemory
