/**
 * 🎮 KIDS UI COMPONENTS - Part 3
 * 
 * Bolalar uchun maxsus cartoon-style komponentlar
 * SVG karakterlar, jonli animatsiyalar, o'yin hissi
 * 
 * ✅ XUSUSIYATLAR:
 * - Yumaloq, katta ko'zli karakterlar
 * - Idle wiggle, hover float
 * - Click sparkle, success celebration
 * - Page enter slide
 * - Tooltip bubble pop
 * 
 * ❌ TAQIQLANADI:
 * - Flash, blink
 * - Juda tez animatsiya
 * - Mayda elementlar
 */

import { useState, useCallback, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import './KidsUI3.css'

// ═══════════════════════════════════════════════════════════════
// 🌟 CARTOON STAR - Katta ko'zli yulduz
// ═══════════════════════════════════════════════════════════════
export const CartoonStar = memo(function CartoonStar({
  size = 80,
  color = '#ffd54f',
  happy = true,
  wiggle = true,
  onClick,
  className = ''
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`cartoon-star ${wiggle ? 'cartoon-star--wiggle' : ''} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Star body */}
      <motion.path
        d="M50 5 L61 35 L95 35 L68 55 L79 90 L50 70 L21 90 L32 55 L5 35 L39 35 Z"
        fill={color}
        stroke="#f9a825"
        strokeWidth="2"
        animate={wiggle ? {
          rotate: [0, 3, -3, 0],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Left eye */}
      <ellipse cx="40" cy="45" rx="8" ry="10" fill="white" />
      <motion.circle
        cx="42"
        cy="47"
        r="5"
        fill="#333"
        animate={{ cy: [47, 45, 47] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <circle cx="44" cy="44" r="2" fill="white" />
      {/* Right eye */}
      <ellipse cx="60" cy="45" rx="8" ry="10" fill="white" />
      <motion.circle
        cx="62"
        cy="47"
        r="5"
        fill="#333"
        animate={{ cy: [47, 45, 47] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
      />
      <circle cx="64" cy="44" r="2" fill="white" />
      {/* Mouth */}
      {happy ? (
        <path
          d="M40 60 Q50 72 60 60"
          fill="none"
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M40 65 Q50 58 60 65"
          fill="none"
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {/* Blush */}
      <circle cx="32" cy="55" r="5" fill="#ffab91" opacity="0.6" />
      <circle cx="68" cy="55" r="5" fill="#ffab91" opacity="0.6" />
    </motion.svg>
  )
})

CartoonStar.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  happy: PropTypes.bool,
  wiggle: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// ☁️ CARTOON CLOUD - Yumshoq bulut
// ═══════════════════════════════════════════════════════════════
export const CartoonCloud = memo(function CartoonCloud({
  size = 120,
  color = '#e3f2fd',
  happy = true,
  float = true,
  onClick,
  className = ''
}) {
  return (
    <motion.svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 72"
      className={`cartoon-cloud ${className}`}
      onClick={onClick}
      animate={float ? { y: [0, -8, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.1 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Cloud body */}
      <ellipse cx="60" cy="45" rx="50" ry="25" fill={color} />
      <ellipse cx="35" cy="35" rx="25" ry="20" fill={color} />
      <ellipse cx="85" cy="35" rx="25" ry="20" fill={color} />
      <ellipse cx="50" cy="25" rx="20" ry="18" fill={color} />
      <ellipse cx="70" cy="25" rx="20" ry="18" fill={color} />
      {/* Shadow */}
      <ellipse cx="60" cy="50" rx="45" ry="15" fill="#bbdefb" opacity="0.5" />
      {/* Left eye */}
      <ellipse cx="45" cy="40" rx="6" ry="8" fill="white" />
      <motion.circle
        cx="46"
        cy="42"
        r="4"
        fill="#333"
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Right eye */}
      <ellipse cx="75" cy="40" rx="6" ry="8" fill="white" />
      <motion.circle
        cx="76"
        cy="42"
        r="4"
        fill="#333"
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
      />
      {/* Mouth */}
      {happy ? (
        <path
          d="M52 52 Q60 60 68 52"
          fill="none"
          stroke="#333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ) : (
        <ellipse cx="60" cy="55" rx="5" ry="4" fill="#333" />
      )}
      {/* Blush */}
      <circle cx="38" cy="48" r="4" fill="#f8bbd9" opacity="0.7" />
      <circle cx="82" cy="48" r="4" fill="#f8bbd9" opacity="0.7" />
    </motion.svg>
  )
})

CartoonCloud.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  happy: PropTypes.bool,
  float: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎈 CARTOON BALLOON - Rangli shar
// ═══════════════════════════════════════════════════════════════
export const CartoonBalloon = memo(function CartoonBalloon({
  size = 80,
  color = '#f48fb1',
  wiggle = true,
  onClick,
  className = ''
}) {
  return (
    <motion.svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 80 112"
      className={`cartoon-balloon ${className}`}
      onClick={onClick}
      animate={wiggle ? { rotate: [-5, 5, -5] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.1, y: -10 }}
      whileTap={{ scale: 0.95 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Balloon body */}
      <ellipse cx="40" cy="40" rx="35" ry="40" fill={color} />
      {/* Highlight */}
      <ellipse cx="28" cy="28" rx="10" ry="12" fill="white" opacity="0.4" />
      {/* Knot */}
      <polygon points="40,78 35,85 45,85" fill={color} />
      {/* String */}
      <motion.path
        d="M40 85 Q35 95 40 105 Q45 115 40 112"
        fill="none"
        stroke="#90a4ae"
        strokeWidth="2"
        animate={{ d: [
          "M40 85 Q35 95 40 105 Q45 115 40 112",
          "M40 85 Q45 95 40 105 Q35 115 40 112",
          "M40 85 Q35 95 40 105 Q45 115 40 112"
        ]}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Face - eyes */}
      <ellipse cx="30" cy="38" rx="5" ry="6" fill="white" />
      <circle cx="31" cy="39" r="3" fill="#333" />
      <ellipse cx="50" cy="38" rx="5" ry="6" fill="white" />
      <circle cx="51" cy="39" r="3" fill="#333" />
      {/* Smile */}
      <path
        d="M32 50 Q40 58 48 50"
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  )
})

CartoonBalloon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  wiggle: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🌈 RAINBOW ARC - Kamalak yoyi
// ═══════════════════════════════════════════════════════════════
export const RainbowArc = memo(function RainbowArc({
  width = 200,
  animated = true,
  className = ''
}) {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#9b59b6']
  
  return (
    <motion.svg
      width={width}
      height={width * 0.5}
      viewBox="0 0 200 100"
      className={`rainbow-arc ${className}`}
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {colors.map((color, i) => (
        <motion.path
          key={i}
          d={`M ${10 + i * 8} 100 A ${90 - i * 8} ${90 - i * 8} 0 0 1 ${190 - i * 8} 100`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
        />
      ))}
      {/* Clouds at ends */}
      <circle cx="15" cy="95" r="12" fill="#e3f2fd" />
      <circle cx="25" cy="90" r="10" fill="#e3f2fd" />
      <circle cx="185" cy="95" r="12" fill="#e3f2fd" />
      <circle cx="175" cy="90" r="10" fill="#e3f2fd" />
    </motion.svg>
  )
})

RainbowArc.propTypes = {
  width: PropTypes.number,
  animated: PropTypes.bool,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎯 BIG PLAY BUTTON - Katta o'ynash tugmasi
// ═══════════════════════════════════════════════════════════════
export const BigPlayButton = memo(function BigPlayButton({
  onClick,
  color = 'green',
  size = 'large',
  children = "O'ynash",
  icon,
  className = ''
}) {
  const [sparkles, setSparkles] = useState([])

  const handleClick = useCallback((e) => {
    // Create sparkles
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 800)
    
    onClick?.(e)
  }, [onClick])

  return (
    <motion.button
      className={`big-play-button big-play-button--${color} big-play-button--${size} ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.08, y: -6 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="big-play-button__bg" />
      <span className="big-play-button__content">
        {icon && <span className="big-play-button__icon">{icon}</span>}
        <span className="big-play-button__text">{children}</span>
      </span>
      
      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="big-play-button__sparkle"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: 1.5,
              opacity: 0,
              x: Math.cos(sparkle.angle * Math.PI / 180) * 60,
              y: Math.sin(sparkle.angle * Math.PI / 180) * 60
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            ✦
          </motion.span>
        ))}
      </AnimatePresence>
      
      <span className="big-play-button__shine" />
    </motion.button>
  )
})

BigPlayButton.propTypes = {
  onClick: PropTypes.func,
  color: PropTypes.oneOf(['green', 'blue', 'yellow', 'pink', 'purple']),
  size: PropTypes.oneOf(['medium', 'large', 'huge']),
  children: PropTypes.node,
  icon: PropTypes.node,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎪 BOUNCY ICON - Sakrovchi ikonka
// ═══════════════════════════════════════════════════════════════
export const BouncyIcon = memo(function BouncyIcon({
  children,
  delay = 0,
  color = '#4fc3f7',
  size = 64,
  onClick,
  className = ''
}) {
  return (
    <motion.div
      className={`bouncy-icon ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: color
      }}
      onClick={onClick}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        y: [0, -8, 0]
      }}
      transition={{
        scale: { delay, type: 'spring', stiffness: 400, damping: 15 },
        rotate: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
      }}
      whileHover={{ scale: 1.2, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.div>
  )
})

BouncyIcon.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎠 PAGE ENTER ANIMATION - Sahifa kirish animatsiyasi
// ═══════════════════════════════════════════════════════════════
export const PageEnterAnimation = memo(function PageEnterAnimation({
  children,
  direction = 'up',
  delay = 0,
  className = ''
}) {
  const variants = {
    up: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } }
  }

  return (
    <motion.div
      className={`page-enter ${className}`}
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  )
})

PageEnterAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'scale']),
  delay: PropTypes.number,
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 💬 BUBBLE TOOLTIP - Pufakcha tooltip
// ═══════════════════════════════════════════════════════════════
export const BubbleTooltip = memo(function BubbleTooltip({
  children,
  content,
  position = 'top',
  color = 'blue',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div 
      className={`bubble-tooltip-wrapper ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`bubble-tooltip bubble-tooltip--${position} bubble-tooltip--${color}`}
            initial={{ opacity: 0, scale: 0.5, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <span className="bubble-tooltip__content">{content}</span>
            <span className="bubble-tooltip__tail" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

BubbleTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom']),
  color: PropTypes.oneOf(['blue', 'green', 'yellow', 'pink']),
  className: PropTypes.string
}

// ═══════════════════════════════════════════════════════════════
// 🎊 REWARD BURST - Mukofot portlashi
// ═══════════════════════════════════════════════════════════════
export const RewardBurst = memo(function RewardBurst({
  show,
  onComplete,
  type = 'stars',
  message = 'Ajoyib!'
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  const particles = type === 'stars' 
    ? ['⭐', '🌟', '✨', '💫']
    : type === 'hearts'
    ? ['❤️', '💖', '💕', '💗']
    : ['🎉', '🎊', '🎈', '🎁']

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="reward-burst"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Particles */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              className="reward-burst__particle"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                x: Math.cos((i / 16) * Math.PI * 2) * 150,
                y: Math.sin((i / 16) * Math.PI * 2) * 150,
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 1,
                delay: i * 0.03,
                ease: 'easeOut'
              }}
            >
              {particles[i % particles.length]}
            </motion.span>
          ))}
          
          {/* Message */}
          <motion.div
            className="reward-burst__message"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

RewardBurst.propTypes = {
  show: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
  type: PropTypes.oneOf(['stars', 'hearts', 'confetti']),
  message: PropTypes.string
}
