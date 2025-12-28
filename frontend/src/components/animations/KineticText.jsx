import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './KineticText.css';

const KineticText = ({ 
  text, 
  effect = 'wave', // 'wave', 'bounce', 'typewriter', 'glitch', 'rainbow', 'scramble'
  className = '',
  delay = 0,
  stagger = 0.05,
  loop = false,
  onHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const letters = text.split('');

  useEffect(() => {
    if (effect === 'typewriter') {
      controls.start(i => ({
        opacity: 1,
        transition: { delay: delay + i * stagger }
      }));
    }
  }, [effect, delay, stagger, controls]);

  const getVariants = () => {
    switch (effect) {
      case 'wave':
        return {
          initial: { y: 0 },
          animate: (i) => ({
            y: [0, -20, 0],
            transition: {
              delay: delay + i * stagger,
              duration: 0.5,
              repeat: loop ? Infinity : 0,
              repeatDelay: 2
            }
          }),
          hover: { y: -10, color: 'var(--primary-color)' }
        };

      case 'bounce':
        return {
          initial: { scale: 1, y: 0 },
          animate: (i) => ({
            scale: [1, 1.2, 1],
            y: [0, -15, 0],
            transition: {
              delay: delay + i * stagger,
              duration: 0.4,
              repeat: loop ? Infinity : 0,
              repeatDelay: 3
            }
          }),
          hover: { scale: 1.3, color: 'var(--secondary-color, #8b5cf6)' }
        };

      case 'typewriter':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          hover: { scale: 1.1 }
        };

      case 'glitch':
        return {
          initial: { x: 0, opacity: 1 },
          animate: (i) => ({
            x: [0, -3, 3, -3, 0],
            opacity: [1, 0.8, 1, 0.8, 1],
            transition: {
              delay: delay + i * stagger,
              duration: 0.3,
              repeat: loop ? Infinity : 0,
              repeatDelay: 5
            }
          }),
          hover: { 
            x: [-2, 2, -2, 0],
            textShadow: [
              '2px 0 #ff0000, -2px 0 #00ffff',
              '-2px 0 #ff0000, 2px 0 #00ffff',
              '2px 0 #ff0000, -2px 0 #00ffff',
              '0 0 transparent'
            ]
          }
        };

      case 'rainbow':
        return {
          initial: { color: 'inherit' },
          animate: (i) => ({
            color: [
              '#ef4444', '#f59e0b', '#22c55e', 
              '#06b6d4', '#8b5cf6', '#ec4899'
            ],
            transition: {
              delay: delay + i * 0.1,
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }
          }),
          hover: { scale: 1.2, rotate: [0, -5, 5, 0] }
        };

      default:
        return {
          initial: {},
          animate: {},
          hover: {}
        };
    }
  };

  const variants = getVariants();

  return (
    <span 
      className={`kinetic-text ${effect} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="kinetic-letter"
          custom={i}
          initial={variants.initial}
          animate={variants.animate(i)}
          whileHover={onHover ? variants.hover : {}}
          style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
};

// Scramble Text Effect
export const ScrambleText = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev =>
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) return text[index];
            if (letter === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return (
    <motion.span
      className={`scramble-text ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {displayText}
    </motion.span>
  );
};

// Counting Text
export const CountingText = ({ 
  from = 0, 
  to, 
  duration = 2,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      setCount(Math.floor(from + (to - from) * easeProgress));

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [from, to, duration]);

  return (
    <motion.span 
      className={`counting-text ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

export default KineticText;
