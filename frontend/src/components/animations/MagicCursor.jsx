// Magic Cursor - Sehrli cursor effekti
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MagicCursor.css'

// Chiroyli emoji to'plami
const EMOJIS = {
  default: '🌟',
  button: '👋',
  link: '✨',
  input: '✍️',
  card: '💫',
  image: '🖼️',
  click: '💥'
}

const MagicCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [trail, setTrail] = useState([])
  const [emoji, setEmoji] = useState(EMOJIS.default)
  const trailRef = useRef([])
  const idCounter = useRef(0)

  // Cursor harakatini kuzatish
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      
      // Trail qo'shish - unique id bilan
      idCounter.current += 1
      const newTrail = { x: e.clientX, y: e.clientY, id: `trail-${idCounter.current}` }
      trailRef.current = [...trailRef.current.slice(-6), newTrail]
      setTrail([...trailRef.current])
    }

    const handleMouseDown = () => {
      setIsClicking(true)
      setEmoji(EMOJIS.click)
    }
    const handleMouseUp = () => {
      setIsClicking(false)
    }

    // Hover elementlarni aniqlash
    const handleMouseOver = (e) => {
      const target = e.target
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        setIsHovering(true)
        setEmoji(EMOJIS.button)
      } else if (target.tagName === 'A' || target.closest('a')) {
        setIsHovering(true)
        setEmoji(EMOJIS.link)
      } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsHovering(true)
        setEmoji(EMOJIS.input)
      } else if (target.closest('.card') || target.closest('.child-card')) {
        setIsHovering(true)
        setEmoji(EMOJIS.card)
      } else if (target.tagName === 'IMG') {
        setIsHovering(true)
        setEmoji(EMOJIS.image)
      } else {
        setIsHovering(false)
        setEmoji(EMOJIS.default)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Mobile da ko'rsatmaslik
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null
  }

  return (
    <div className="magic-cursor-container">
      {/* Trail */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="cursor-trail"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              left: point.x,
              top: point.y,
              background: `hsl(${(index * 30) % 360}, 70%, 60%)`
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main cursor */}
      <motion.div
        className={`magic-cursor ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
        animate={{
          x: position.x - 16,
          y: position.y - 16
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <span className="cursor-emoji">{emoji}</span>
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="cursor-glow"
        animate={{
          x: position.x - 50,
          y: position.y - 50,
          opacity: isHovering ? 0.3 : 0.15
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15
        }}
      />
    </div>
  )
}

export default MagicCursor
