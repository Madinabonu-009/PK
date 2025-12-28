import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import './ImpossibleScroll.css';

// Horizontal scroll on vertical scroll
export const HorizontalScroll = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className={`horizontal-scroll-container ${className}`}>
      <div className="horizontal-scroll-sticky">
        <motion.div className="horizontal-scroll-content" style={{ x: smoothX }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// Elastic bounce sections
export const ElasticSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`elastic-section ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { 
        scale: 1, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 10,
          mass: 1
        }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// Reverse parallax
export const ReverseParallax = ({ children, speed = 0.5, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `-${speed * 100}%`]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, speed * 20]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={`reverse-parallax ${className}`}
      style={{ y, rotate, scale }}
    >
      {children}
    </motion.div>
  );
};

// Zoom reveal
export const ZoomReveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 0]);

  return (
    <motion.div
      ref={ref}
      className={`zoom-reveal ${className}`}
      style={{ 
        scale, 
        opacity,
        filter: useTransform(blur, v => `blur(${v}px)`)
      }}
    >
      {children}
    </motion.div>
  );
};

// Stagger reveal
export const StaggerReveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`stagger-reveal ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      )) : (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

// Infinite loop scroll
export const InfiniteScroll = ({ children, speed = 20, direction = 'left', className = '' }) => {
  return (
    <div className={`infinite-scroll ${className}`}>
      <motion.div
        className="infinite-scroll-track"
        animate={{
          x: direction === 'left' ? [0, -1000] : [-1000, 0]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear"
          }
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

// Scroll progress indicator
export const ScrollProgress = ({ className = '' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={`scroll-progress ${className}`}
      style={{ scaleX, transformOrigin: "left" }}
    />
  );
};

export default {
  HorizontalScroll,
  ElasticSection,
  ReverseParallax,
  ZoomReveal,
  StaggerReveal,
  InfiniteScroll,
  ScrollProgress
};
