// 🧒 8. Gamification Animation - Confetti
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Confetti.css'

const colors = ['#667eea', '#764ba2', '#f093fb', '#22c55e', '#ffc107', '#ef4444']

const Confetti = ({ active, duration = 3000 }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, duration])

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="confetti-container">
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="confetti-particle"
              initial={{ 
                x: `${particle.x}vw`, 
                y: -20, 
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: '100vh', 
                rotate: particle.rotation + 720,
                opacity: 0
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2 + Math.random(), 
                delay: particle.delay,
                ease: 'linear'
              }}
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

export default Confetti
