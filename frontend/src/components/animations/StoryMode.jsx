// 🎭 8. STORY MODE - Har sahifa mini multfilm
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import './StoryMode.css'

// Story container - scroll = scene change
export const StoryContainer = ({ children, scenes }) => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [currentScene, setCurrentScene] = useState(0)

  useEffect(() => {
    return scrollYProgress.on('change', (progress) => {
      const sceneIndex = Math.min(
        Math.floor(progress * scenes.length),
        scenes.length - 1
      )
      setCurrentScene(sceneIndex)
    })
  }, [scrollYProgress, scenes.length])

  return (
    <div ref={containerRef} className="story-container">
      <div className="story-progress">
        {scenes.map((_, index) => (
          <motion.div
            key={index}
            className={`story-dot ${index === currentScene ? 'active' : ''}`}
            animate={{
              scale: index === currentScene ? 1.3 : 1,
              backgroundColor: index === currentScene ? 'var(--primary-color)' : 'var(--border-color)'
            }}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

// Individual story scene
export const StoryScene = ({ 
  children, 
  background,
  title,
  icon,
  index = 0
}) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100])

  return (
    <motion.section
      ref={ref}
      className="story-scene"
      style={{ opacity, scale, y, background }}
    >
      <motion.div 
        className="story-scene-icon"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          delay: index * 0.2
        }}
      >
        {icon}
      </motion.div>
      {title && <h2 className="story-scene-title">{title}</h2>}
      <div className="story-scene-content">
        {children}
      </div>
    </motion.section>
  )
}

// Animated story character
export const StoryCharacter = ({ 
  emoji, 
  action = 'idle',
  position = 'center'
}) => {
  const actions = {
    idle: {
      y: [0, -5, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    wave: {
      rotate: [0, 20, -10, 20, 0],
      transition: { duration: 1, repeat: Infinity, repeatDelay: 2 }
    },
    jump: {
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
    },
    dance: {
      rotate: [0, 10, -10, 10, -10, 0],
      y: [0, -5, 0, -5, 0],
      transition: { duration: 1, repeat: Infinity }
    }
  }

  return (
    <motion.div
      className={`story-character story-character-${position}`}
      animate={actions[action]}
    >
      {emoji}
    </motion.div>
  )
}

// Story transition effect
export const StoryTransition = ({ type = 'fade' }) => {
  const transitions = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '-100%' }
    },
    zoom: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 2, opacity: 0 }
    }
  }

  return (
    <motion.div
      className="story-transition"
      {...transitions[type]}
      transition={{ duration: 0.5 }}
    />
  )
}
