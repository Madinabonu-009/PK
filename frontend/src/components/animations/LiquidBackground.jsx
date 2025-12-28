import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './LiquidBackground.css';

const LiquidBackground = ({ 
  children, 
  className = '',
  colors = ['#6366f1', '#8b5cf6', '#ec4899'],
  speed = 1,
  blur = 60,
  interactive = true
}) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [blobs, setBlobs] = useState([]);

  // Generate blobs
  useEffect(() => {
    const newBlobs = colors.map((color, i) => ({
      id: i,
      color,
      x: 20 + (i * 30),
      y: 30 + (i % 2) * 40,
      size: 300 + Math.random() * 200,
      duration: 15 + Math.random() * 10
    }));
    setBlobs(newBlobs);
  }, [colors]);

  // Mouse tracking
  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`liquid-background ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* SVG Filter for gooey effect */}
      <svg className="liquid-svg-filter">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" 
              result="goo" 
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Animated blobs */}
      <div className="liquid-blobs" style={{ filter: `blur(${blur}px)` }}>
        {blobs.map((blob) => (
          <motion.div
            key={blob.id}
            className="liquid-blob"
            style={{
              width: blob.size,
              height: blob.size,
              background: blob.color,
            }}
            animate={{
              x: [
                `${blob.x}%`,
                `${blob.x + 20}%`,
                `${blob.x - 10}%`,
                `${blob.x}%`
              ],
              y: [
                `${blob.y}%`,
                `${blob.y - 20}%`,
                `${blob.y + 15}%`,
                `${blob.y}%`
              ],
              scale: [1, 1.2, 0.9, 1],
              rotate: [0, 90, 180, 360]
            }}
            transition={{
              duration: blob.duration / speed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Interactive blob following cursor */}
        {interactive && (
          <motion.div
            className="liquid-blob interactive-blob"
            animate={{
              x: `${mousePos.x}%`,
              y: `${mousePos.y}%`
            }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 20
            }}
            style={{
              width: 200,
              height: 200,
              background: colors[0],
              opacity: 0.5
            }}
          />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="liquid-overlay" />

      {/* Content */}
      <div className="liquid-content">
        {children}
      </div>
    </div>
  );
};

// Morphing blob component
export const MorphingBlob = ({ 
  color = 'var(--primary-color)', 
  size = 200,
  className = '' 
}) => {
  return (
    <motion.div
      className={`morphing-blob ${className}`}
      style={{
        width: size,
        height: size,
        background: color
      }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%'
        ],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Gradient mesh background
export const GradientMesh = ({ className = '' }) => {
  return (
    <div className={`gradient-mesh ${className}`}>
      <div className="mesh-gradient mesh-1" />
      <div className="mesh-gradient mesh-2" />
      <div className="mesh-gradient mesh-3" />
      <div className="mesh-gradient mesh-4" />
    </div>
  );
};

// Animated gradient text
export const GradientText = ({ children, className = '' }) => {
  return (
    <motion.span
      className={`gradient-text ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {children}
    </motion.span>
  );
};

export default LiquidBackground;
