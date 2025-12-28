// Welcome Overlay - Xush kelibsiz animatsiyasi
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './WelcomeOverlay.css'

const STORAGE_KEY = 'playkids_user_memory'

const WelcomeOverlay = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('Xush kelibsiz! 🎉')
  const [greeting, setGreeting] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [visitCount, setVisitCount] = useState(1)

  useEffect(() => {
    // Vaqtni aniqlash
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('morning')
      setGreeting('Xayrli tong! ☀️')
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay('day')
      setGreeting('Xayrli kun! 🌤️')
    } else if (hour >= 17 && hour < 21) {
      setTimeOfDay('evening')
      setGreeting('Xayrli kech! 🌅')
    } else {
      setTimeOfDay('night')
      setGreeting('Xayrli tun! 🌙')
    }

    // Xotirani yuklash
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const count = (parsed.visitCount || 0) + 1
        setVisitCount(count)
        setIsFirstVisit(false)
        
        const userName = parsed.userName ? `, ${parsed.userName}` : ''
        if (count > 10) {
          setWelcomeMessage(`Sizni kutib turgandik${userName}! 🌟`)
        } else {
          setWelcomeMessage(`Yana ko'rishganimizdan xursandmiz${userName}! 💖`)
        }
        
        // Yangilash
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          visitCount: count,
          lastVisit: Date.now()
        }))
      } else {
        // Birinchi tashrif
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          visitCount: 1,
          lastVisit: Date.now(),
          lastPage: '/',
          favoritePages: {},
          userName: null
        }))
      }
    } catch {
      // Ignore storage errors
    }

    // Faqat birinchi yuklanishda ko'rsatish
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setIsVisible(true)
      sessionStorage.setItem('hasSeenWelcome', 'true')
      
      // 3 sekunddan keyin yopish
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const getEmoji = () => {
    if (isFirstVisit) return '🎉'
    if (visitCount > 10) return '⭐'
    switch (timeOfDay) {
      case 'morning': return '☀️'
      case 'day': return '🌤️'
      case 'evening': return '🌅'
      case 'night': return '🌙'
      default: return '👋'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`welcome-overlay ${timeOfDay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setIsVisible(false)}
        >
          <motion.div
            className="welcome-content"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 20,
              delay: 0.2 
            }}
          >
            <motion.span 
              className="welcome-emoji"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {getEmoji()}
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {welcomeMessage}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {greeting}
            </motion.p>
          </motion.div>

          {/* Floating particles */}
          <div className="welcome-particles">
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className="particle"
                initial={{ 
                  opacity: 0,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: -100,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800)
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1,
                  ease: 'easeOut'
                }}
              >
                {['✨', '⭐', '🌟', '💫', '🎈', '🎉'][Math.floor(Math.random() * 6)]}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WelcomeOverlay
