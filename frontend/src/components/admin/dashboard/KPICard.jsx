import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './KPICard.css'

// Animated counter component
function AnimatedCounter({ value, duration = 1000, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef(null)
  const animationFrame = useRef(null)

  useEffect(() => {
    const targetValue = typeof value === 'number' ? value : parseFloat(value) || 0
    
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(easeOut * targetValue)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
      }
    }
    
    startTime.current = null
    animationFrame.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [value, duration])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <span>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  )
}

// Trend indicator
function TrendIndicator({ value, direction }) {
  if (!value && value !== 0) return null
  
  const isPositive = direction === 'up'
  const color = isPositive ? 'var(--success-color)' : 'var(--error-color)'
  const arrow = isPositive ? '↑' : '↓'
  
  return (
    <span className="kpi-trend" style={{ color }}>
      {arrow} {Math.abs(value)}%
    </span>
  )
}

// Skeleton loader
function KPICardSkeleton() {
  return (
    <div className="kpi-card kpi-card--skeleton">
      <div className="kpi-skeleton-icon" />
      <div className="kpi-skeleton-content">
        <div className="kpi-skeleton-title" />
        <div className="kpi-skeleton-value" />
        <div className="kpi-skeleton-desc" />
      </div>
    </div>
  )
}

function KPICard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  color = 'blue',
  onClick,
  path,
  loading = false,
  prefix = '',
  suffix = '',
  animate = true
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (path) {
      navigate(path)
    }
  }

  if (loading) {
    return <KPICardSkeleton />
  }

  const colorClasses = {
    blue: 'kpi-card--blue',
    green: 'kpi-card--green',
    orange: 'kpi-card--orange',
    red: 'kpi-card--red',
    purple: 'kpi-card--purple',
    cyan: 'kpi-card--cyan'
  }

  return (
    <motion.div
      className={`kpi-card ${colorClasses[color] || colorClasses.blue}`}
      onClick={handleClick}
      whileHover={{ translateY: -4, boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="kpi-icon-wrapper">
        <span className="kpi-icon">{icon}</span>
      </div>
      
      <div className="kpi-content">
        <p className="kpi-title">{title}</p>
        <div className="kpi-value-row">
          <h3 className="kpi-value">
            {animate ? (
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            ) : (
              <span>{prefix}{value}{suffix}</span>
            )}
          </h3>
          {trend && <TrendIndicator value={trend.value} direction={trend.direction} />}
        </div>
        {description && <p className="kpi-description">{description}</p>}
      </div>

      <div className="kpi-arrow">→</div>
    </motion.div>
  )
}

export default KPICard
export { KPICardSkeleton, AnimatedCounter, TrendIndicator }
