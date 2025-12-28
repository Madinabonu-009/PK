import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './DynamicShadow.css';

const DynamicShadow = ({ 
  children, 
  className = '',
  intensity = 1,
  color = 'rgba(0, 0, 0, 0.3)',
  followCursor = true,
  ambient = true
}) => {
  const containerRef = useRef(null);
  const [lightSource, setLightSource] = useState({ x: 50, y: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const shadowX = useSpring(useTransform(mouseX, [-1, 1], [30 * intensity, -30 * intensity]), springConfig);
  const shadowY = useSpring(useTransform(mouseY, [-1, 1], [30 * intensity, -30 * intensity]), springConfig);
  const shadowBlur = useSpring(useTransform(
    [mouseX, mouseY],
    ([x, y]) => 20 + Math.abs(x) * 10 + Math.abs(y) * 10
  ), springConfig);

  // Global mouse tracking for ambient light
  useEffect(() => {
    if (!ambient) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setLightSource({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [ambient]);

  const handleMouseMove = (e) => {
    if (!followCursor || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`dynamic-shadow-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--light-x': `${lightSource.x}%`,
        '--light-y': `${lightSource.y}%`
      }}
    >
      {/* Ambient light gradient */}
      {ambient && (
        <div className="ambient-light" />
      )}

      {/* Main content with dynamic shadow */}
      <motion.div
        className="shadow-content"
        style={{
          boxShadow: useTransform(
            [shadowX, shadowY, shadowBlur],
            ([x, y, blur]) => `${x}px ${y}px ${blur}px ${color}`
          )
        }}
      >
        {children}
      </motion.div>

      {/* Reflection */}
      <motion.div 
        className="shadow-reflection"
        style={{
          opacity: useTransform(mouseY, [-1, 1], [0.1, 0.3])
        }}
      />
    </motion.div>
  );
};

// Light beam effect
export const LightBeam = ({ className = '' }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`light-beam ${className}`}
      style={{
        '--beam-x': `${mousePos.x}%`,
        '--beam-y': `${mousePos.y}%`
      }}
    />
  );
};

// Spotlight effect
export const Spotlight = ({ children, className = '', size = 300 }) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={containerRef}
      className={`spotlight-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <motion.div
        className="spotlight-mask"
        animate={{
          background: isActive
            ? `radial-gradient(circle ${size}px at ${position.x}px ${position.y}px, transparent 0%, rgba(0,0,0,0.8) 100%)`
            : 'rgba(0,0,0,0.8)'
        }}
        transition={{ duration: 0.1 }}
      />
      <div className="spotlight-content">
        {children}
      </div>
    </div>
  );
};

// Glow card
export const GlowCard = ({ children, className = '', glowColor = 'var(--primary-color)' }) => {
  const cardRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`glow-card ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        '--glow-x': `${glowPosition.x}%`,
        '--glow-y': `${glowPosition.y}%`,
        '--glow-color': glowColor
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="glow-card-glow" />
      <div className="glow-card-content">
        {children}
      </div>
    </motion.div>
  );
};

export default DynamicShadow;
