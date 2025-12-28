/**
 * Mobile-specific Effects
 * Mobil qurilmalar uchun maxsus effektlar
 */
import { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import './MobileEffects.css'

// Pull to refresh
export const PullToRefresh = memo(function PullToRefresh({ 
  onRefresh, 
  children,
  threshold = 80,
  className = '' 
}) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pullDistance = useMotionValue(0)
  const rotation = useTransform(pullDistance, [0, threshold], [0, 360])

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      setPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (pulling && !refreshing) {
      const touch = e.touches[0]
      const distance = Math.max(0, touch.clientY - 100)
      pullDistance.set(Math.min(distance, threshold * 1.5))
    }
  }, [pulling, refreshing, pullDistance, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance.get() >= threshold && !refreshing) {
      setRefreshing(true)
      await onRefresh?.()
      setRefreshing(false)
    }
    pullDistance.set(0)
    setPulling(false)
  }, [pullDistance, threshold, refreshing, onRefresh])

  return (
    <div 
      className={`pull-to-refresh ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div 
        className="pull-to-refresh__indicator"
        style={{ 
          y: useTransform(pullDistance, [0, threshold], [-50, 20]),
          opacity: useTransform(pullDistance, [0, threshold / 2, threshold], [0, 0.5, 1])
        }}
      >
        <motion.span 
          className="pull-to-refresh__icon"
          style={{ rotate: rotation }}
        >
          {refreshing ? '⏳' : '🔄'}
        </motion.span>
        <span className="pull-to-refresh__text">
          {refreshing ? 'Yangilanmoqda...' : 'Yangilash uchun torting'}
        </span>
      </motion.div>
      {children}
    </div>
  )
})

// Swipe actions
export const SwipeActions = memo(function SwipeActions({ 
  children,
  leftAction,
  rightAction,
  leftColor = '#22c55e',
  rightColor = '#ef4444',
  threshold = 100,
  className = '' 
}) {
  const x = useMotionValue(0)
  const [swiping, setSwiping] = useState(false)

  const leftOpacity = useTransform(x, [0, threshold], [0, 1])
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0])

  const handleDragEnd = (_, info) => {
    if (info.offset.x > threshold) {
      leftAction?.()
    } else if (info.offset.x < -threshold) {
      rightAction?.()
    }
    setSwiping(false)
  }

  return (
    <div className={`swipe-actions ${className}`}>
      <motion.div 
        className="swipe-actions__left"
        style={{ opacity: leftOpacity, backgroundColor: leftColor }}
      >
        ✓
      </motion.div>
      <motion.div 
        className="swipe-actions__right"
        style={{ opacity: rightOpacity, backgroundColor: rightColor }}
      >
        ✕
      </motion.div>
      <motion.div
        className="swipe-actions__content"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  )
})

// Bottom sheet
export const BottomSheet = memo(function BottomSheet({ 
  isOpen, 
  onClose, 
  children,
  snapPoints = [0.5, 0.9],
  className = '' 
}) {
  const [currentSnap, setCurrentSnap] = useState(0)
  const y = useMotionValue(0)

  const handleDragEnd = (_, info) => {
    if (info.velocity.y > 500 || info.offset.y > 100) {
      onClose?.()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="bottom-sheet__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`bottom-sheet ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: `${(1 - snapPoints[currentSnap]) * 100}%` }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y }}
          >
            <div className="bottom-sheet__handle" />
            <div className="bottom-sheet__content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

// Haptic feedback simulation (visual)
export const HapticButton = memo(function HapticButton({ 
  children, 
  onClick,
  className = '' 
}) {
  const [pressed, setPressed] = useState(false)

  const handleClick = (e) => {
    setPressed(true)
    // Vibration API (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    setTimeout(() => setPressed(false), 100)
    onClick?.(e)
  }

  return (
    <motion.button
      className={`haptic-btn ${pressed ? 'haptic-btn--pressed' : ''} ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
})

// Touch ripple effect
export const TouchRipple = memo(function TouchRipple({ 
  children, 
  className = '' 
}) {
  const [ripples, setRipples] = useState([])

  const handleTouch = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    const x = (touch.clientX || touch.pageX) - rect.left
    const y = (touch.clientY || touch.pageY) - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }

  return (
    <div 
      className={`touch-ripple ${className}`}
      onTouchStart={handleTouch}
      onClick={handleTouch}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="touch-ripple__effect"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </div>
  )
})

// Gesture hint
export const GestureHint = memo(function GestureHint({ 
  type = 'swipe', // 'swipe', 'tap', 'pinch', 'scroll'
  direction = 'left',
  show = true,
  className = '' 
}) {
  const hints = {
    swipe: '👆',
    tap: '👆',
    pinch: '🤏',
    scroll: '👆'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`gesture-hint gesture-hint--${type} gesture-hint--${direction} ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <motion.span
            className="gesture-hint__icon"
            animate={{
              x: type === 'swipe' ? (direction === 'left' ? [-20, 20] : [20, -20]) : 0,
              y: type === 'scroll' ? [0, 20, 0] : 0,
              scale: type === 'tap' ? [1, 0.8, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {hints[type]}
          </motion.span>
          <span className="gesture-hint__text">
            {type === 'swipe' && `${direction === 'left' ? 'Chapga' : 'O\'ngga'} suring`}
            {type === 'tap' && 'Bosing'}
            {type === 'scroll' && 'Pastga suring'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// Safe area wrapper
export const SafeArea = memo(function SafeArea({ 
  children, 
  top = true, 
  bottom = true,
  className = '' 
}) {
  return (
    <div 
      className={`safe-area ${top ? 'safe-area--top' : ''} ${bottom ? 'safe-area--bottom' : ''} ${className}`}
    >
      {children}
    </div>
  )
})

export default {
  PullToRefresh,
  SwipeActions,
  BottomSheet,
  HapticButton,
  TouchRipple,
  GestureHint,
  SafeArea
}
