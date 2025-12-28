import { motion, AnimatePresence } from 'framer-motion';
import './PageTransitions.css';

// Liquid wipe transition
export const LiquidWipe = ({ children, isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          <motion.div
            className="liquid-wipe-overlay"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Zoom rotate blur transition
export const ZoomRotateBlur = ({ children }) => {
  return (
    <motion.div
      initial={{ 
        scale: 0.8, 
        rotate: -10, 
        opacity: 0,
        filter: 'blur(20px)'
      }}
      animate={{ 
        scale: 1, 
        rotate: 0, 
        opacity: 1,
        filter: 'blur(0px)'
      }}
      exit={{ 
        scale: 1.2, 
        rotate: 10, 
        opacity: 0,
        filter: 'blur(20px)'
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.76, 0, 0.24, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};

// Slide with color shift
export const SlideColorShift = ({ children, direction = 'right' }) => {
  const directions = {
    right: { x: '100%', initial: '-100%' },
    left: { x: '-100%', initial: '100%' },
    up: { y: '-100%', initial: '100%' },
    down: { y: '100%', initial: '-100%' }
  };

  const dir = directions[direction];

  return (
    <motion.div
      className="slide-color-shift"
      initial={{ 
        x: dir.initial || 0, 
        y: dir.initial || 0,
        filter: 'hue-rotate(-30deg) saturate(1.5)'
      }}
      animate={{ 
        x: 0, 
        y: 0,
        filter: 'hue-rotate(0deg) saturate(1)'
      }}
      exit={{ 
        x: dir.x || 0, 
        y: dir.y || 0,
        filter: 'hue-rotate(30deg) saturate(0.5)'
      }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Morph shape transition
export const MorphTransition = ({ children }) => {
  return (
    <>
      <motion.div
        className="morph-shape"
        initial={{ 
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          backgroundColor: 'var(--primary-color)'
        }}
        animate={{ 
          clipPath: [
            'polygon(0 0, 0 0, 0 100%, 0 100%)',
            'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
          ],
          backgroundColor: [
            'var(--primary-color)',
            'var(--secondary-color, #8b5cf6)',
            'var(--primary-color)'
          ]
        }}
        transition={{ 
          duration: 1,
          times: [0, 0.5, 1],
          ease: [0.76, 0, 0.24, 1]
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
};

// Flip 3D transition
export const Flip3D = ({ children, direction = 'horizontal' }) => {
  const rotateAxis = direction === 'horizontal' ? 'rotateY' : 'rotateX';
  
  return (
    <motion.div
      className="flip-3d-container"
      initial={{ 
        [rotateAxis]: 90,
        opacity: 0,
        scale: 0.8
      }}
      animate={{ 
        [rotateAxis]: 0,
        opacity: 1,
        scale: 1
      }}
      exit={{ 
        [rotateAxis]: -90,
        opacity: 0,
        scale: 0.8
      }}
      transition={{ 
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1]
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

// Curtain reveal
export const CurtainReveal = ({ children }) => {
  return (
    <>
      <motion.div
        className="curtain curtain-left"
        initial={{ x: 0 }}
        animate={{ x: '-100%' }}
        exit={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="curtain curtain-right"
        initial={{ x: 0 }}
        animate={{ x: '100%' }}
        exit={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
};

// Pixelate transition
export const PixelateTransition = ({ children }) => {
  return (
    <motion.div
      className="pixelate-container"
      initial={{ 
        filter: 'blur(10px)',
        opacity: 0
      }}
      animate={{ 
        filter: 'blur(0px)',
        opacity: 1
      }}
      exit={{ 
        filter: 'blur(10px)',
        opacity: 0
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// Combined advanced transition
export const AdvancedPageTransition = ({ children, type = 'default' }) => {
  const variants = {
    default: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    zoom: {
      initial: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)' }
    },
    slide: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 }
    },
    rotate: {
      initial: { opacity: 0, rotate: -5, scale: 0.95 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: 5, scale: 1.05 }
    }
  };

  return (
    <motion.div
      variants={variants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default {
  LiquidWipe,
  ZoomRotateBlur,
  SlideColorShift,
  MorphTransition,
  Flip3D,
  CurtainReveal,
  PixelateTransition,
  AdvancedPageTransition
};
