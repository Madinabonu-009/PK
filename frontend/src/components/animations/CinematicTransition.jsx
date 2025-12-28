/**
 * 🎥 CINEMATIC SCENE TRANSITION COMPONENT
 * 
 * Sahifa emas, SAHNA almashsin
 * 
 * ✅ XUSUSIYATLAR:
 * - Layerlar chuqurlik bilan harakatlansin
 * - Fade + scale + blur kombinatsiyasi
 * - 600–900ms davomiylik
 * - Multfilm sahnasi hissi
 * 
 * ❌ TAQIQLANADI:
 * - Oddiy page transition
 * - Keskin cut
 */

import { useState, useCallback, createContext, useContext, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CinematicTransition.css'

// Context for scene management
const CinematicContext = createContext({
  currentScene: 0,
  goToScene: () => {},
  nextScene: () => {},
  prevScene: () => {}
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC PROVIDER - Scene management
// ═══════════════════════════════════════════════════════════════
export const CinematicProvider = memo(function CinematicProvider({
  children,
  initialScene = 0,
  totalScenes = 1
}) {
  const [currentScene, setCurrentScene] = useState(initialScene)
  const [direction, setDirection] = useState(1)

  const goToScene = useCallback((index) => {
    setDirection(index > currentScene ? 1 : -1)
    setCurrentScene(Math.max(0, Math.min(index, totalScenes - 1)))
  }, [currentScene, totalScenes])

  const nextScene = useCallback(() => {
    if (currentScene < totalScenes - 1) {
      setDirection(1)
      setCurrentScene(prev => prev + 1)
    }
  }, [currentScene, totalScenes])

  const prevScene = useCallback(() => {
    if (currentScene > 0) {
      setDirection(-1)
      setCurrentScene(prev => prev - 1)
    }
  }, [currentScene])

  return (
    <CinematicContext.Provider value={{ currentScene, direction, goToScene, nextScene, prevScene }}>
      {children}
    </CinematicContext.Provider>
  )
})

// Hook to use cinematic context
export const useCinematic = () => useContext(CinematicContext)

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC CONTAINER - Asosiy wrapper
// ═══════════════════════════════════════════════════════════════
export const CinematicContainer = memo(function CinematicContainer({
  children,
  className = ''
}) {
  return (
    <div className={`cinematic-container ${className}`}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC SCENE - Sahna komponenti
// ═══════════════════════════════════════════════════════════════
export const CinematicScene = memo(function CinematicScene({
  children,
  index,
  className = ''
}) {
  const { currentScene, direction } = useCinematic()
  const isActive = currentScene === index

  // Cinematic variants with depth
  const variants = {
    enter: (dir) => ({
      opacity: 0,
      scale: dir > 0 ? 0.9 : 1.1,
      z: dir > 0 ? -100 : 100,
      filter: 'blur(10px)',
      rotateY: dir > 0 ? -5 : 5
    }),
    center: {
      opacity: 1,
      scale: 1,
      z: 0,
      filter: 'blur(0px)',
      rotateY: 0
    },
    exit: (dir) => ({
      opacity: 0,
      scale: dir > 0 ? 1.1 : 0.9,
      z: dir > 0 ? 100 : -100,
      filter: 'blur(10px)',
      rotateY: dir > 0 ? 5 : -5
    })
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={index}
          className={`cinematic-scene ${className}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.5 },
            filter: { duration: 0.6 }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC LAYER - Parallax layer
// ═══════════════════════════════════════════════════════════════
export const CinematicLayer = memo(function CinematicLayer({
  children,
  depth = 0,
  className = ''
}) {
  const { direction } = useCinematic()
  
  // Deeper layers move more
  const depthMultiplier = 1 + depth * 0.3

  const variants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 50 * depthMultiplier : -50 * depthMultiplier,
      scale: 1 - depth * 0.05
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -50 * depthMultiplier : 50 * depthMultiplier,
      scale: 1 + depth * 0.05
    })
  }

  const layerClass = depth === 0 ? 'cinematic-layer--background' :
                     depth === 1 ? 'cinematic-layer--middle' :
                     depth === 2 ? 'cinematic-layer--foreground' :
                     'cinematic-layer--content'

  return (
    <motion.div
      className={`cinematic-layer ${layerClass} ${className}`}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.7 + depth * 0.1,
        ease: [0.4, 0, 0.2, 1],
        delay: depth * 0.05
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC PAGE TRANSITION - Sahifa o'tishi
// ═══════════════════════════════════════════════════════════════
export const CinematicPageTransition = memo(function CinematicPageTransition({
  children,
  pageKey,
  type = 'slide',
  className = ''
}) {
  const transitionVariants = {
    slide: {
      enter: { opacity: 0, x: 100, scale: 0.95, filter: 'blur(8px)' },
      center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, x: -100, scale: 1.05, filter: 'blur(8px)' }
    },
    zoom: {
      enter: { opacity: 0, scale: 0.8, filter: 'blur(12px)' },
      center: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.2, filter: 'blur(12px)' }
    },
    fade: {
      enter: { opacity: 0, filter: 'blur(10px)' },
      center: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' }
    },
    flip: {
      enter: { opacity: 0, rotateY: -90, scale: 0.9 },
      center: { opacity: 1, rotateY: 0, scale: 1 },
      exit: { opacity: 0, rotateY: 90, scale: 0.9 }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className={`cinematic-page ${className}`}
        variants={transitionVariants[type]}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC CARD - 3D card with depth
// ═══════════════════════════════════════════════════════════════
export const CinematicCard = memo(function CinematicCard({
  children,
  color = 'white',
  onClick,
  className = ''
}) {
  return (
    <motion.div
      className={`cinematic-card cinematic-card--${color} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -30, rotateX: 10 }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        rotateX: 2,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🎥 CINEMATIC OVERLAY - Transition overlay
// ═══════════════════════════════════════════════════════════════
export const CinematicOverlay = memo(function CinematicOverlay({
  show,
  type = 'fade',
  duration = 0.5
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`cinematic-overlay cinematic-overlay--${type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        />
      )}
    </AnimatePresence>
  )
})

export default CinematicProvider
