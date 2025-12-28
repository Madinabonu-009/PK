// 🌱 2. UI GROWS WITH SCROLL - Tirik dizayn
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './GrowingUI.css'

// Element that grows as you scroll (blur olib tashlandi)
export const GrowingElement = ({ 
  children, 
  className = '',
  startScale = 0.8,
  endScale = 1,
  startOpacity = 0.5,
  endOpacity = 1
}) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  const scale = useTransform(scrollYProgress, [0, 1], [startScale, endScale])
  const opacity = useTransform(scrollYProgress, [0, 1], [startOpacity, endOpacity])

  return (
    <motion.div
      ref={ref}
      className={`growing-element ${className}`}
      style={{
        scale,
        opacity
      }}
    >
      {children}
    </motion.div>
  )
}

// Image that reveals with scroll
export const GrowingImage = ({ src, alt, className = '' }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['circle(10% at 50% 50%)', 'circle(100% at 50% 50%)']
  )

  const saturation = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1])

  return (
    <motion.div ref={ref} className={`growing-image-container ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="growing-image"
        style={{
          clipPath,
          filter: `saturate(${saturation.get()})`
        }}
      />
    </motion.div>
  )
}

// Text that types out as you scroll
export const GrowingText = ({ text, className = '' }) => {
  const ref = useRef(null)
  const [visibleChars, setVisibleChars] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  })

  useEffect(() => {
    return scrollYProgress.on('change', (progress) => {
      setVisibleChars(Math.floor(progress * text.length))
    })
  }, [scrollYProgress, text.length])

  return (
    <span ref={ref} className={`growing-text ${className}`}>
      {text.slice(0, visibleChars)}
      <span className="growing-text-cursor">|</span>
    </span>
  )
}
