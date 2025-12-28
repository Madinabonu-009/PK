import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './LiquidButton.css';

const LiquidButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false 
}) => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Liquid blob transforms
  const blobX = useTransform(x, [-50, 50], [-20, 20]);
  const blobY = useTransform(y, [-50, 50], [-20, 20]);
  const blobScale = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return 1 + distance * 0.002;
    }
  );

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = (e) => {
    if (disabled) return;
    
    // Add ripple
    const rect = buttonRef.current.getBoundingClientRect();
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 1000);

    onClick?.(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`liquid-button ${variant} ${size} ${className} ${disabled ? 'disabled' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
    >
      {/* Liquid blob background */}
      <motion.div 
        className="liquid-blob"
        style={{
          x: blobX,
          y: blobY,
          scale: isHovered ? blobScale : 1
        }}
      >
        <svg viewBox="0 0 200 200" className="blob-svg">
          <motion.path
            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            animate={isHovered ? {
              d: [
                "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0",
                "M 100, 100 m -70, -10 a 80,70 0 1,0 140,20 a 80,70 0 1,0 -140,-20",
                "M 100, 100 m -80, 5 a 70,80 0 1,0 160,-10 a 70,80 0 1,0 -160,10",
                "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
              ]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>

      {/* Glow effect */}
      <motion.div 
        className="liquid-glow"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Ripples */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="liquid-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}

      {/* Content */}
      <motion.span 
        className="liquid-content"
        animate={{
          y: isHovered ? -2 : 0
        }}
      >
        {children}
      </motion.span>

      {/* Shine effect */}
      <motion.div 
        className="liquid-shine"
        animate={{
          x: isHovered ? ['-100%', '200%'] : '-100%'
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
};

export default LiquidButton;
