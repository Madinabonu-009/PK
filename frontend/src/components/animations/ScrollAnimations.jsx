/**
 * Scroll-triggered Animations
 * Scroll bo'yicha ishlaydigan animatsiyalar
 */
import { memo, useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion'
import './ScrollAnimations.css'

// Scroll bo'yicha paydo bo'lish
export const ScrollReveal = memo(function ScrollReveal({ 
  children, 
  direction = 'up', // 'up', 'down', 'left', 'right', 'fade'
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  className = '' 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    fade: { x: 0, y: 0 }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
})

// Parallax effekt
export const ParallaxSection = memo(function ParallaxSection({ 
  children, 
  speed = 0.5, // -1 dan 1 gacha
  className = '' 
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className={`parallax-section ${className}`}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  )
})

// Sticky reveal
export const StickyReveal = memo(function StickyReveal({ 
  children, 
  className = '' 
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8])

  return (
    <div ref={ref} className={`sticky-reveal ${className}`}>
      <motion.div style={{ opacity, scale }}>
        {children}
      </motion.div>
    </div>
  )
})

// Horizontal scroll section
export const HorizontalScroll = memo(function HorizontalScroll({ 
  children, 
  className = '' 
}) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-75%'])

  return (
    <div ref={containerRef} className={`horizontal-scroll ${className}`}>
      <div className="horizontal-scroll__sticky">
        <motion.div className="horizontal-scroll__content" style={{ x }}>
          {children}
        </motion.div>
      </div>
    </div>
  )
})

// Text reveal (harf-harf)
export const TextReveal = memo(function TextReveal({ 
  text, 
  className = '',
  delay = 0 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const words = text.split(' ')

  return (
    <span ref={ref} className={`text-reveal ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="text-reveal__word">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="text-reveal__char"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.3,
                delay: delay + (wordIndex * 0.1) + (charIndex * 0.03)
              }}
            >
              {char}
            </motion.span>
          ))}
          <span>&nbsp;</span>
        </span>
      ))}
    </span>
  )
})

// Counter animation
export const AnimatedCounter = memo(function AnimatedCounter({ 
  value, 
  duration = 2,
  prefix = '',
  suffix = '',
  className = '' 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = parseInt(value)
      const incrementTime = (duration * 1000) / end
      
      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start >= end) clearInterval(timer)
      }, incrementTime)

      return () => clearInterval(timer)
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={`animated-counter ${className}`}>
      {prefix}{count}{suffix}
    </span>
  )
})

// Stagger children
export const StaggerContainer = memo(function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
})

export const StaggerItem = memo(function StaggerItem({ 
  children, 
  className = '' 
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut' }
        }
      }}
    >
      {children}
    </motion.div>
  )
})

// Zoom on scroll
export const ZoomOnScroll = memo(function ZoomOnScroll({ 
  children, 
  className = '' 
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className={`zoom-on-scroll ${className}`}>
      <motion.div style={{ scale, opacity }}>
        {children}
      </motion.div>
    </div>
  )
})

export default {
  ScrollReveal,
  ParallaxSection,
  StickyReveal,
  HorizontalScroll,
  TextReveal,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
  ZoomOnScroll
}
