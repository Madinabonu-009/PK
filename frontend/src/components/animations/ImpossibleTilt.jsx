import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './ImpossibleTilt.css';

const ImpossibleTilt = ({ 
  children, 
  className = '',
  intensity = 20,
  perspective = 1000,
  scale = 1.05,
  glare = true,
  depth = true
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), springConfig);

  // Depth layers transforms
  const layer1X = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);
  const layer2X = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const layer2Y = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);
  const layer3X = useTransform(mouseX, [-0.5, 0.5], [-45, 45]);
  const layer3Y = useTransform(mouseY, [-0.5, 0.5], [-45, 45]);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(
    [mouseX, mouseY],
    ([x, y]) => Math.min(Math.abs(x) + Math.abs(y), 0.5)
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`impossible-tilt ${className}`}
      style={{
        perspective,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="tilt-card"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          scale: isHovered ? scale : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Shadow layer */}
        <motion.div 
          className="tilt-shadow"
          style={{
            x: useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig),
            y: useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig),
          }}
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
            scale: isHovered ? 0.95 : 1
          }}
        />

        {/* Depth layers */}
        {depth && (
          <>
            <motion.div 
              className="depth-layer depth-layer-1"
              style={{ x: layer1X, y: layer1Y, translateZ: 20 }}
            />
            <motion.div 
              className="depth-layer depth-layer-2"
              style={{ x: layer2X, y: layer2Y, translateZ: 40 }}
            />
            <motion.div 
              className="depth-layer depth-layer-3"
              style={{ x: layer3X, y: layer3Y, translateZ: 60 }}
            />
          </>
        )}

        {/* Main content */}
        <motion.div 
          className="tilt-content"
          style={{ translateZ: 50 }}
        >
          {children}
        </motion.div>

        {/* Glare effect */}
        {glare && (
          <motion.div 
            className="tilt-glare"
            style={{
              background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
              opacity: isHovered ? glareOpacity : 0
            }}
          />
        )}

        {/* Edge highlights */}
        <div className="tilt-edges">
          <motion.div 
            className="edge edge-top"
            animate={{ opacity: isHovered ? 0.5 : 0 }}
          />
          <motion.div 
            className="edge edge-bottom"
            animate={{ opacity: isHovered ? 0.3 : 0 }}
          />
          <motion.div 
            className="edge edge-left"
            animate={{ opacity: isHovered ? 0.4 : 0 }}
          />
          <motion.div 
            className="edge edge-right"
            animate={{ opacity: isHovered ? 0.4 : 0 }}
          />
        </div>

        {/* Floating elements */}
        <motion.div 
          className="floating-element floating-1"
          style={{ x: layer2X, y: layer2Y, translateZ: 80 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.5
          }}
        >
          ✨
        </motion.div>
        <motion.div 
          className="floating-element floating-2"
          style={{ x: layer3X, y: layer3Y, translateZ: 100 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.5
          }}
        >
          ⭐
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ImpossibleTilt;
