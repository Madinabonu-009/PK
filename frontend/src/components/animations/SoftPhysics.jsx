// 🧩 9. SOFT PHYSICS UI - Haqiqiy og'irlik hissi
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import './SoftPhysics.css'

// Physics-based draggable element
export const PhysicsDraggable = ({ 
  children, 
  className = '',
  constraints = { left: -100, right: 100, top: -100, bottom: 100 },
  elasticity = 0.5
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  return (
    <motion.div
      className={`physics-draggable ${className}`}
      drag
      dragConstraints={constraints}
      dragElastic={elasticity}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      style={{ x, y }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
    >
      {children}
    </motion.div>
  )
}

// Bouncy button with physics
export const BouncyButton = ({ children, onClick, className = '' }) => {
  const [isPressed, setIsPressed] = useState(false)
  
  const springConfig = { stiffness: 400, damping: 10 }
  const scale = useSpring(1, springConfig)
  const y = useSpring(0, springConfig)

  const handlePress = () => {
    setIsPressed(true)
    scale.set(0.9)
    y.set(4)
  }

  const handleRelease = () => {
    setIsPressed(false)
    scale.set(1.05) // Overshoot
    y.set(-2)
    setTimeout(() => {
      scale.set(1)
      y.set(0)
    }, 150)
  }

  return (
    <motion.button
      className={`bouncy-button ${className}`}
      style={{ scale, y }}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={() => isPressed && handleRelease()}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.button>
  )
}

// Drawer with physics
export const PhysicsDrawer = ({ 
  isOpen, 
  onClose, 
  children,
  side = 'right',
  width = 300
}) => {
  const x = useSpring(isOpen ? 0 : (side === 'right' ? width : -width), {
    stiffness: 300,
    damping: 30
  })

  useEffect(() => {
    x.set(isOpen ? 0 : (side === 'right' ? width : -width))
  }, [isOpen, side, width, x])

  return (
    <>
      {isOpen && (
        <motion.div
          className="physics-drawer-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      <motion.div
        className={`physics-drawer physics-drawer-${side}`}
        style={{ 
          x,
          width,
          [side]: 0
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) {
            onClose()
          }
        }}
      >
        {children}
      </motion.div>
    </>
  )
}

// Wobbly card
export const WobblyCard = ({ children, className = '' }) => {
  const cardRef = useRef(null)
  const rotateX = useSpring(0, { stiffness: 150, damping: 15 })
  const rotateY = useSpring(0, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    rotateY.set(mouseX * 0.05)
    rotateX.set(-mouseY * 0.05)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`wobbly-card ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

// Inertia scroll container
export const InertiaScroll = ({ children, className = '' }) => {
  const containerRef = useRef(null)
  const x = useMotionValue(0)
  
  return (
    <motion.div
      ref={containerRef}
      className={`inertia-scroll ${className}`}
      drag="x"
      dragConstraints={containerRef}
      style={{ x }}
      dragTransition={{ 
        power: 0.3,
        timeConstant: 200
      }}
    >
      {children}
    </motion.div>
  )
}

// Rubber band effect
export const RubberBand = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`rubber-band ${className}`}
      whileHover={{
        scale: [1, 1.1, 0.95, 1.05, 1],
        transition: { duration: 0.4 }
      }}
      whileTap={{
        scale: 0.9,
        transition: { type: 'spring', stiffness: 400 }
      }}
    >
      {children}
    </motion.div>
  )
}
