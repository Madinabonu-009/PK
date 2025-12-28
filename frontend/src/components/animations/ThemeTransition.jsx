// 🌙 12. Dark / Light Mode Transition - Radial Reveal
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeTransition.css'

const ThemeTransition = () => {
  const { theme } = useTheme()
  const [showTransition, setShowTransition] = useState(false)
  const [prevTheme, setPrevTheme] = useState(theme)
  const [clickPosition, setClickPosition] = useState({ x: '50%', y: '50%' })

  useEffect(() => {
    if (theme !== prevTheme) {
      setShowTransition(true)
      const timer = setTimeout(() => {
        setShowTransition(false)
        setPrevTheme(theme)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [theme, prevTheme])

  // Global click listener to capture theme toggle position
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('.theme-toggle, .theme-toggle-btn')
      if (target) {
        setClickPosition({
          x: `${e.clientX}px`,
          y: `${e.clientY}px`
        })
      }
    }
    window.addEventListener('click', handleClick, true)
    return () => window.removeEventListener('click', handleClick, true)
  }, [])

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          className="theme-transition-overlay"
          initial={{ 
            clipPath: `circle(0% at ${clickPosition.x} ${clickPosition.y})` 
          }}
          animate={{ 
            clipPath: `circle(150% at ${clickPosition.x} ${clickPosition.y})` 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            backgroundColor: theme === 'dark' ? '#0f0f23' : 
                           theme === 'blue' ? '#f0f9ff' :
                           theme === 'green' ? '#f0fdf4' :
                           theme === 'purple' ? '#faf5ff' : '#ffffff'
          }}
        />
      )}
    </AnimatePresence>
  )
}

export default ThemeTransition
