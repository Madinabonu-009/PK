// 🧸 6. EMOTIONAL FEEDBACK ENGINE - UI his qiladi
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EmotionalFeedback.css'

const EmotionContext = createContext()

export const EmotionProvider = ({ children }) => {
  const [emotion, setEmotion] = useState('neutral') // neutral, happy, sad, excited

  const feel = useCallback((newEmotion, duration = 2000) => {
    setEmotion(newEmotion)
    if (duration > 0) {
      setTimeout(() => setEmotion('neutral'), duration)
    }
  }, [])

  const emotionStyles = {
    neutral: { scale: 1, filter: 'none' },
    happy: { scale: 1.01, filter: 'brightness(1.05)' },
    sad: { scale: 0.99, filter: 'brightness(0.95) saturate(0.9)' },
    excited: { scale: 1.02, filter: 'brightness(1.1) saturate(1.1)' },
    error: { scale: 0.98, filter: 'hue-rotate(10deg)' }
  }

  return (
    <EmotionContext.Provider value={{ emotion, feel, emotionStyles }}>
      <motion.div
        className="emotion-wrapper"
        animate={emotionStyles[emotion]}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </EmotionContext.Provider>
  )
}

export const useEmotion = () => {
  const context = useContext(EmotionContext)
  if (!context) {
    return { 
      emotion: 'neutral', 
      feel: () => {},
      emotionStyles: {}
    }
  }
  return context
}

// Emotional input field
export const EmotionalInput = ({ 
  value, 
  onChange, 
  isValid = true,
  placeholder,
  type = 'text',
  className = ''
}) => {
  const { feel } = useEmotion()
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e) => {
    onChange(e)
    if (e.target.value && isValid) {
      feel('happy', 500)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!isValid && value) {
      feel('sad', 1500)
    }
  }

  return (
    <motion.div
      className={`emotional-input-wrapper ${className}`}
      animate={{
        scale: !isValid && value ? 0.98 : isFocused ? 1.01 : 1,
        x: !isValid && value ? [0, -5, 5, -5, 5, 0] : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.input
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`emotional-input ${!isValid && value ? 'invalid' : ''}`}
        animate={{
          borderColor: !isValid && value ? '#ef4444' : 
                       isFocused ? 'var(--primary-color)' : 'var(--border-color)'
        }}
      />
      <AnimatePresence>
        {!isValid && value && (
          <motion.span
            className="emotional-input-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
          >
            😢
          </motion.span>
        )}
        {isValid && value && (
          <motion.span
            className="emotional-input-icon"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            exit={{ scale: 0 }}
          >
            😊
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Emotional button
export const EmotionalButton = ({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  className = ''
}) => {
  const { feel } = useEmotion()
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = (e) => {
    if (disabled || loading) return
    feel('excited', 1000)
    onClick?.(e)
  }

  return (
    <motion.button
      className={`emotional-button ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.95 : 1,
        y: isPressed ? 2 : 0
      }}
      whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⏳
        </motion.span>
      ) : children}
    </motion.button>
  )
}

// Success celebration
export const SuccessCelebration = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="success-celebration"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <motion.span
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
          >
            🎉
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
