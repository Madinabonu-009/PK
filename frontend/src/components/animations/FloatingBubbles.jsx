/**
 * Floating Bubbles / Particles
 * Bolalar bog'chasiga mos suzuvchi pufakchalar
 */
import { memo, useMemo } from 'react'
import './FloatingBubbles.css'

const BUBBLE_EMOJIS = ['🎈', '⭐', '🌟', '💫', '🎀', '🎁', '🌈', '🦋', '🌸', '🍀', '🎨', '📚', '🎵', '🎪']

export const FloatingBubbles = memo(function FloatingBubbles({ 
  count = 15, 
  type = 'mixed', // 'bubbles', 'emojis', 'mixed'
  className = '' 
}) {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: Math.random() * 10 + 15,
      emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)],
      type: type === 'mixed' ? (Math.random() > 0.5 ? 'bubble' : 'emoji') : type
    }))
  }, [count, type])

  return (
    <div className={`floating-bubbles ${className}`} aria-hidden="true">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className={`floating-bubble floating-bubble--${bubble.type === 'emoji' ? 'emoji' : 'circle'}`}
          style={{
            '--size': `${bubble.size}px`,
            '--left': `${bubble.left}%`,
            '--delay': `${bubble.delay}s`,
            '--duration': `${bubble.duration}s`
          }}
        >
          {bubble.type === 'emoji' ? bubble.emoji : null}
        </div>
      ))}
    </div>
  )
})

export const InteractiveParticles = memo(function InteractiveParticles({ 
  count = 30,
  className = '' 
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10
    }))
  }, [count])

  return (
    <div className={`interactive-particles ${className}`} aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="interactive-particle"
          style={{
            '--x': `${particle.x}%`,
            '--y': `${particle.y}%`,
            '--size': `${particle.size}px`,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
})

export const Sparkles = memo(function Sparkles({ className = '' }) {
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 10 + 5
    }))
  }, [])

  return (
    <div className={`sparkles ${className}`} aria-hidden="true">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            '--left': `${sparkle.left}%`,
            '--top': `${sparkle.top}%`,
            '--delay': `${sparkle.delay}s`,
            '--size': `${sparkle.size}px`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  )
})

export default FloatingBubbles
