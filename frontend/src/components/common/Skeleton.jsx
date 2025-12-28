import { memo } from 'react'
import PropTypes from 'prop-types'
import './Skeleton.css'

// Skeleton loader komponenti - loading holatida ko'rsatiladi
const Skeleton = memo(function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  count = 1,
  className = '',
  animation = 'pulse'
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular': return 'skeleton-circular'
      case 'rectangular': return 'skeleton-rectangular'
      case 'card': return 'skeleton-card'
      case 'avatar': return 'skeleton-avatar'
      case 'button': return 'skeleton-button'
      case 'table-row': return 'skeleton-table-row'
      default: return 'skeleton-text'
    }
  }

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || undefined
  }

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div 
      key={i}
      className={`skeleton ${getVariantClass()} skeleton-${animation} ${className}`}
      style={style}
      role="status"
      aria-label="Yuklanmoqda"
    />
  ))

  return count === 1 ? skeletons[0] : <div className="skeleton-group">{skeletons}</div>
})

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular', 'card', 'avatar', 'button', 'table-row']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  count: PropTypes.number,
  className: PropTypes.string,
  animation: PropTypes.oneOf(['pulse', 'wave', 'none'])
}

// Card skeleton
export const CardSkeleton = memo(function CardSkeleton({ count = 1 }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card-wrapper">
          <Skeleton variant="rectangular" height={200} />
          <div className="skeleton-card-content">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  )
})

CardSkeleton.propTypes = {
  count: PropTypes.number
}

// Table skeleton
export const TableSkeleton = memo(function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} variant="text" width={`${100/cols}%`} height={20} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: cols }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${80 + Math.random() * 20}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  )
})

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number
}

// List skeleton
export const ListSkeleton = memo(function ListSkeleton({ count = 5, hasAvatar = false }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-list-item">
          {hasAvatar && <Skeleton variant="avatar" width={40} height={40} />}
          <div className="skeleton-list-content">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
})

ListSkeleton.propTypes = {
  count: PropTypes.number,
  hasAvatar: PropTypes.bool
}

// Stats skeleton
export const StatsSkeleton = memo(function StatsSkeleton({ count = 4 }) {
  return (
    <div className="skeleton-stats">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-stat-card">
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={100} height={14} />
        </div>
      ))}
    </div>
  )
})

StatsSkeleton.propTypes = {
  count: PropTypes.number
}

export default Skeleton
