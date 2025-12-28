// 🧬 4. DNA ANIMATION SYSTEM - Takrorlanmaydigan motion
import { useMemo } from 'react'
import { motion } from 'framer-motion'

// Generate unique but controlled random values
const generateDNA = (seed) => {
  // Simple seeded random
  const random = (s) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  return {
    duration: 0.3 + random(seed) * 0.3, // 0.3 - 0.6s
    delay: random(seed + 1) * 0.2,      // 0 - 0.2s
    offsetX: (random(seed + 2) - 0.5) * 20, // -10 to 10px
    offsetY: (random(seed + 3) - 0.5) * 20,
    rotation: (random(seed + 4) - 0.5) * 10, // -5 to 5deg
    scale: 0.95 + random(seed + 5) * 0.1     // 0.95 - 1.05
  }
}

// DNA-powered fade in
export const DNAFadeIn = ({ children, id = 0, className = '' }) => {
  const dna = useMemo(() => generateDNA(id + Date.now() % 1000), [id])

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: 30 + dna.offsetY,
        x: dna.offsetX,
        rotate: dna.rotation,
        scale: dna.scale
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1
      }}
      transition={{
        duration: dna.duration,
        delay: dna.delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  )
}

// DNA-powered hover effect
export const DNAHover = ({ children, id = 0, className = '' }) => {
  const dna = useMemo(() => generateDNA(id), [id])

  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1 + dna.scale * 0.05,
        rotate: dna.rotation * 0.5,
        y: -5 + dna.offsetY * 0.2,
        transition: { duration: dna.duration }
      }}
    >
      {children}
    </motion.div>
  )
}

// DNA-powered stagger container
export const DNAStagger = ({ children, baseDelay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08 + Math.random() * 0.04, // 0.08 - 0.12s
            delayChildren: baseDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export const DNAStaggerItem = ({ children, index = 0 }) => {
  const dna = useMemo(() => generateDNA(index), [index])

  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20 + dna.offsetY,
          scale: 0.9 + dna.scale * 0.05
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            duration: dna.duration,
            ease: 'easeOut'
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Hook to get DNA values
export const useDNA = (seed = 0) => {
  return useMemo(() => generateDNA(seed + Date.now() % 1000), [seed])
}
