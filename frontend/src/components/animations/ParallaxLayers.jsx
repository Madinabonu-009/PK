import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './ParallaxLayers.css';

const ParallaxLayers = ({ children, intensity = 1, className = '' }) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  const backgroundY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -100 * intensity]),
    springConfig
  );
  
  const midgroundY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -200 * intensity]),
    springConfig
  );
  
  const foregroundY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -300 * intensity]),
    springConfig
  );

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (clientX - innerWidth / 2) / innerWidth,
        y: (clientY - innerHeight / 2) / innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`parallax-container ${className}`}>
      {/* Background Layer */}
      <motion.div 
        className="parallax-layer parallax-bg"
        style={{ 
          y: backgroundY,
          x: mousePosition.x * -20 * intensity,
        }}
      >
        <div className="parallax-shapes">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="parallax-shape"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Midground Layer */}
      <motion.div 
        className="parallax-layer parallax-mid"
        style={{ 
          y: midgroundY,
          x: mousePosition.x * -40 * intensity,
        }}
      >
        <div className="parallax-clouds">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="parallax-cloud"
              style={{
                left: `${i * 22}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                x: [0, 50, 0],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Foreground Layer - Content */}
      <motion.div 
        className="parallax-layer parallax-fg"
        style={{ 
          y: foregroundY,
          x: mousePosition.x * -60 * intensity,
        }}
      >
        {children}
      </motion.div>

      {/* Floating particles */}
      <div className="parallax-particles">
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ParallaxLayers;
