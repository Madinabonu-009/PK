/**
 * 🪄 UI MORPHING COMPONENT
 * 
 * Tugma → karta → sahifa o'tishi MORPH orqali
 * 
 * ✅ XUSUSIYATLAR:
 * - Fade YO'Q
 * - Page reload YO'Q
 * - Elementlar o'z shaklini o'zgartirib ketadi
 * - Smooth layout animations
 * 
 * MISOL:
 * Boshlash tugmasi → kengayadi → formaga aylanadi → sahifani ochadi
 */

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import './UIMorphing.css'

// ═══════════════════════════════════════════════════════════════
// 🪄 MORPH BUTTON - Tugmadan kartaga aylanadi
// ═══════════════════════════════════════════════════════════════
export const MorphButton = memo(function MorphButton({
  children,
  expandedContent,
  color = 'blue',
  onExpand,
  onCollapse,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = useCallback(() => {
    if (isExpanded) {
      onCollapse?.()
    } else {
      onExpand?.()
    }
    setIsExpanded(!isExpanded)
  }, [isExpanded, onExpand, onCollapse])

  return (
    <LayoutGroup>
      <motion.div
        layout
        className={`morph-button morph-button--${color} ${isExpanded ? 'morph-button--expanded' : ''} ${className}`}
        onClick={!isExpanded ? handleToggle : undefined}
        initial={false}
        animate={{
          borderRadius: isExpanded ? 24 : 999
        }}
        transition={{
          layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
          borderRadius: { duration: 0.4 }
        }}
      >
        <motion.div layout="position" className="morph-button__content">
          {!isExpanded ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.span>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="morph-button__expanded"
            >
              {expandedContent}
              <button 
                className="morph-button__close"
                onClick={handleToggle}
                aria-label="Yopish"
              >
                ✕
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🪄 MORPH CARD - Kartadan modal/sahifaga aylanadi
// ═══════════════════════════════════════════════════════════════
export const MorphCard = memo(function MorphCard({
  children,
  expandedContent,
  thumbnail,
  title,
  color = 'white',
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <motion.div
        layoutId="morph-card"
        className={`morph-card morph-card--${color} ${className}`}
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        {thumbnail && (
          <motion.div layoutId="morph-card-thumb" className="morph-card__thumb">
            {thumbnail}
          </motion.div>
        )}
        <motion.div layoutId="morph-card-content" className="morph-card__content">
          {title && <motion.h3 layoutId="morph-card-title">{title}</motion.h3>}
          {children}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              className="morph-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="morph-card"
              className={`morph-card morph-card--expanded morph-card--${color}`}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <button 
                className="morph-card__close"
                onClick={() => setIsExpanded(false)}
                aria-label="Yopish"
              >
                ✕
              </button>
              {thumbnail && (
                <motion.div layoutId="morph-card-thumb" className="morph-card__thumb morph-card__thumb--expanded">
                  {thumbnail}
                </motion.div>
              )}
              <motion.div layoutId="morph-card-content" className="morph-card__content">
                {title && <motion.h3 layoutId="morph-card-title">{title}</motion.h3>}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {expandedContent || children}
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🪄 MORPH CONTAINER - Umumiy morph wrapper
// ═══════════════════════════════════════════════════════════════
export const MorphContainer = memo(function MorphContainer({
  children,
  states,
  currentState = 0,
  className = ''
}) {
  return (
    <LayoutGroup>
      <motion.div
        layout
        className={`morph-container ${className}`}
        transition={{
          layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {states?.[currentState] || children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  )
})

// ═══════════════════════════════════════════════════════════════
// 🪄 MORPH LIST ITEM - List elementlari uchun
// ═══════════════════════════════════════════════════════════════
export const MorphListItem = memo(function MorphListItem({
  children,
  expandedContent,
  id,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      layoutId={`morph-list-${id}`}
      className={`morph-list-item ${isExpanded ? 'morph-list-item--expanded' : ''} ${className}`}
      onClick={() => setIsExpanded(!isExpanded)}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div layout="position">
        {children}
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="morph-list-item__expanded"
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default MorphButton
