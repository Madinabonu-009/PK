/**
 * 🔝 BACK TO TOP BUTTON
 * 
 * Bolalar uchun yuqoriga qaytish tugmasi
 * Cartoon-style, jonli animatsiya
 */

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BackToTop.css'

export const BackToTop = memo(function BackToTop({
  showAfter = 300,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfter)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfter])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`back-to-top ${className}`}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Yuqoriga qaytish"
        >
          <span className="back-to-top__icon">↑</span>
          <span className="back-to-top__shine" />
        </motion.button>
      )}
    </AnimatePresence>
  )
})

export default BackToTop
