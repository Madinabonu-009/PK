import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import './ParticleFlow.css';

const ParticleFlow = ({ 
  children,
  particleCount = 50,
  particleType = 'mixed', // 'dots', 'stars', 'emoji', 'mixed'
  interactive = true,
  flowDirection = 'up', // 'up', 'down', 'left', 'right', 'random'
  className = ''
}) => {
  const containerRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState([]);

  const emojis = ['⭐', '✨', '💫', '🌟', '🎈', '🎉', '💖', '🌸', '🦋', '🍀'];

  // Generate particles
  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      type: particleType === 'mixed' 
        ? ['dot', 'star', 'emoji'][Math.floor(Math.random() * 3)]
        : particleType,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, [particleCount, particleType]);

  // Mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });

    // Add trail
    const trail = {
      id: Date.now(),
      x,
      y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
    setTrails(prev => [...prev.slice(-10), trail]);
  }, [interactive]);

  // Clean up trails
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails(prev => prev.slice(1));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const getFlowAnimation = (particle) => {
    const baseY = flowDirection === 'up' ? [100, -10] : 
                  flowDirection === 'down' ? [-10, 100] : [particle.y, particle.y];
    const baseX = flowDirection === 'left' ? [100, -10] :
                  flowDirection === 'right' ? [-10, 100] : [particle.x, particle.x];

    if (flowDirection === 'random') {
      return {
        x: [particle.x, particle.x + (Math.random() - 0.5) * 50],
        y: [particle.y, particle.y + (Math.random() - 0.5) * 50],
        opacity: [0, particle.opacity, 0],
        scale: [0, 1, 0]
      };
    }

    return {
      x: baseX,
      y: baseY,
      opacity: [0, particle.opacity, 0]
    };
  };

  const renderParticle = (particle) => {
    if (particle.type === 'emoji') {
      return particle.emoji;
    }
    if (particle.type === 'star') {
      return '★';
    }
    return null;
  };

  return (
    <div 
      ref={containerRef}
      className={`particle-flow-container ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background particles */}
      <div className="particles-layer">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className={`particle particle-${particle.type}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: particle.type === 'emoji' ? particle.size * 2 : particle.size,
              width: particle.type === 'dot' ? particle.size : 'auto',
              height: particle.type === 'dot' ? particle.size : 'auto',
            }}
            animate={getFlowAnimation(particle)}
            transition={{
              duration: 5 / particle.speed,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear"
            }}
          >
            {renderParticle(particle)}
          </motion.div>
        ))}
      </div>

      {/* Mouse trails */}
      {interactive && (
        <div className="trails-layer">
          {trails.map((trail, index) => (
            <motion.div
              key={trail.id}
              className="trail-particle"
              style={{
                left: `${trail.x}%`,
                top: `${trail.y}%`,
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {trail.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive glow around cursor */}
      {interactive && (
        <motion.div
          className="cursor-glow"
          animate={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Content */}
      <div className="particle-content">
        {children}
      </div>
    </div>
  );
};

// Confetti burst component
export const ConfettiBurst = ({ trigger, duration = 3000 }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const pieces = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      color: ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 100,
      velocityY: -Math.random() * 50 - 20
    }));

    setConfetti(pieces);

    const timer = setTimeout(() => setConfetti([]), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  return (
    <div className="confetti-container">
      {confetti.map(piece => (
        <motion.div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            rotate: piece.rotation,
            scale: 1 
          }}
          animate={{ 
            x: piece.velocityX * 10,
            y: [0, piece.velocityY * 10, 500],
            rotate: piece.rotation + 720,
            scale: [1, 1, 0]
          }}
          transition={{ 
            duration: duration / 1000,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      ))}
    </div>
  );
};

export default ParticleFlow;
