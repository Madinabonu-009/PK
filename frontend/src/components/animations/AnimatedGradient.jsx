/**
 * Animated Gradient Background
 * Harakatlanuvchi gradient fon - Hero uchun
 */
import { memo } from 'react'
import './AnimatedGradient.css'

export const AnimatedGradient = memo(function AnimatedGradient({ 
  children, 
  variant = 'default',
  speed = 'normal',
  className = '' 
}) {
  return (
    <div className={`animated-gradient animated-gradient--${variant} animated-gradient--${speed} ${className}`}>
      <div className="animated-gradient__layer animated-gradient__layer--1" />
      <div className="animated-gradient__layer animated-gradient__layer--2" />
      <div className="animated-gradient__layer animated-gradient__layer--3" />
      <div className="animated-gradient__content">
        {children}
      </div>
    </div>
  )
})

export const MeshGradient = memo(function MeshGradient({ className = '' }) {
  return (
    <div className={`mesh-gradient ${className}`}>
      <div className="mesh-gradient__blob mesh-gradient__blob--1" />
      <div className="mesh-gradient__blob mesh-gradient__blob--2" />
      <div className="mesh-gradient__blob mesh-gradient__blob--3" />
      <div className="mesh-gradient__blob mesh-gradient__blob--4" />
    </div>
  )
})

export default AnimatedGradient
