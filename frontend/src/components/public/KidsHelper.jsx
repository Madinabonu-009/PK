import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './KidsHelper.css'

const KidsHelper = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)

  const tips = [
    { emoji: '👋', text: "Salom! Men sizga yordam beraman!" },
    { emoji: '📚', text: "O'yinlar bo'limida qiziqarli o'yinlar bor!" },
    { emoji: '🎨', text: "Galereya bo'limida rasmlarimizni ko'ring!" },
    { emoji: '🍽️', text: "Menyu bo'limida kunlik ovqatlar bor!" },
    { emoji: '📅', text: "Tadbirlar bo'limida yangiliklar bor!" },
    { emoji: '✨', text: "Bog'chamizga xush kelibsiz!" }
  ]

  useEffect(() => {
    // Show welcome message for 5 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false)
    }, 5000)

    return () => clearTimeout(welcomeTimer)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isOpen, tips.length])

  const toggleHelper = () => {
    setIsOpen(!isOpen)
    setShowWelcome(false)
  }

  return (
    <div className="kids-helper-container">
      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            className="helper-welcome-bubble"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="welcome-emoji">👋</span>
            <span className="welcome-text">Salom! Menga bos!</span>
            <div className="bubble-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="helper-panel"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="helper-panel-header">
              <span className="helper-title">🌟 Yordamchi</span>
              <button className="helper-close" onClick={toggleHelper}>✕</button>
            </div>
            <div className="helper-panel-content">
              <motion.div
                key={currentTip}
                className="helper-tip"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="tip-emoji">{tips[currentTip].emoji}</span>
                <span className="tip-text">{tips[currentTip].text}</span>
              </motion.div>
              <div className="helper-quick-links">
                <a href="/games" className="quick-link">
                  <span>🎮</span>
                  <span>O'yinlar</span>
                </a>
                <a href="/gallery" className="quick-link">
                  <span>🖼️</span>
                  <span>Galereya</span>
                </a>
                <a href="/menu" className="quick-link">
                  <span>🍽️</span>
                  <span>Menyu</span>
                </a>
                <a href="/calendar" className="quick-link">
                  <span>📅</span>
                  <span>Tadbirlar</span>
                </a>
              </div>
            </div>
            <div className="helper-dots">
              {tips.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentTip ? 'active' : ''}`}
                  onClick={() => setCurrentTip(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Button */}
      <motion.button
        className={`kids-helper-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleHelper}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 0 : [0, -10, 10, -10, 10, 0],
        }}
        transition={{
          rotate: {
            duration: 0.5,
            repeat: isOpen ? 0 : Infinity,
            repeatDelay: 3
          }
        }}
      >
        <span className="helper-icon">
          {isOpen ? '✕' : '🐼'}
        </span>
        <span className="helper-ring" />
        <span className="helper-ring delay" />
      </motion.button>
    </div>
  )
}

export default KidsHelper
