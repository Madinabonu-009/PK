import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NeonGlow.css';

const NeonGlow = ({ 
  children, 
  color = 'primary',
  intensity = 1,
  pulse = true,
  className = '',
  as: Component = 'div'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  const colors = {
    primary: ['#6366f1', '#8b5cf6', '#a855f7'],
    rainbow: ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'],
    cyber: ['#00ff88', '#00ffff', '#ff00ff'],
    fire: ['#ff4500', '#ff6b35', '#ffa500'],
    ice: ['#00bfff', '#87ceeb', '#e0ffff'],
    gold: ['#ffd700', '#ffb347', '#ff8c00']
  };

  const currentColors = colors[color] || colors.primary;

  useEffect(() => {
    if (!pulse) return;
    
    const interval = setInterval(() => {
      setColorIndex(prev => (prev + 1) % currentColors.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [pulse, currentColors.length]);

  const glowColor = currentColors[colorIndex];

  return (
    <motion.div
      className={`neon-glow-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--neon-color': glowColor,
        '--neon-intensity': intensity
      }}
    >
      {/* Multiple glow layers */}
      <motion.div 
        className="neon-layer neon-layer-1"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.05 : 1
        }}
        transition={{ duration: 0.3 }}
      />
      <motion.div 
        className="neon-layer neon-layer-2"
        animate={{
          opacity: isHovered ? 0.8 : 0.3,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.div 
        className="neon-layer neon-layer-3"
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.15 : 1
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Content */}
      <Component className="neon-content">
        {children}
      </Component>

      {/* Animated border */}
      <svg className="neon-border" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.rect
          x="0" y="0" width="100" height="100"
          fill="none"
          strokeWidth="2"
          stroke={glowColor}
          strokeDasharray="400"
          animate={{
            strokeDashoffset: isHovered ? [400, 0] : 400
          }}
          transition={{
            duration: 1,
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Corner accents */}
      <div className="neon-corners">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
      </div>
    </motion.div>
  );
};

// Neon Text Component
export const NeonText = ({ 
  children, 
  color = 'primary',
  size = 'medium',
  animate = true,
  className = ''
}) => {
  const [colorIndex, setColorIndex] = useState(0);
  
  const colors = {
    primary: '#6366f1',
    rainbow: ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'],
    cyber: '#00ff88',
    fire: '#ff4500',
    gold: '#ffd700'
  };

  useEffect(() => {
    if (!animate || !Array.isArray(colors[color])) return;
    
    const interval = setInterval(() => {
      setColorIndex(prev => (prev + 1) % colors[color].length);
    }, 1500);

    return () => clearInterval(interval);
  }, [animate, color]);

  const currentColor = Array.isArray(colors[color]) 
    ? colors[color][colorIndex] 
    : colors[color];

  const sizes = {
    small: '1.5rem',
    medium: '2.5rem',
    large: '4rem',
    xlarge: '6rem'
  };

  return (
    <motion.span
      className={`neon-text ${className}`}
      style={{
        '--neon-text-color': currentColor,
        fontSize: sizes[size]
      }}
      animate={animate ? {
        textShadow: [
          `0 0 10px ${currentColor}, 0 0 20px ${currentColor}, 0 0 40px ${currentColor}`,
          `0 0 20px ${currentColor}, 0 0 40px ${currentColor}, 0 0 80px ${currentColor}`,
          `0 0 10px ${currentColor}, 0 0 20px ${currentColor}, 0 0 40px ${currentColor}`
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.span>
  );
};

export default NeonGlow;
