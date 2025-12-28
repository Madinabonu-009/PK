import { motion } from 'framer-motion'
import './Skeleton.css'

// Base Skeleton Component
function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  animate = true 
}) {
  return (
    <motion.div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// Text Skeleton
function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton 
          key={idx} 
          width={idx === lines - 1 ? lastLineWidth : '100%'} 
          height="14px"
          className="skeleton-line"
        />
      ))}
    </div>
  )
}

// Avatar Skeleton
function SkeletonAvatar({ size = 48 }) {
  return (
    <Skeleton 
      width={`${size}px`} 
      height={`${size}px`} 
      borderRadius="50%"
      className="skeleton-avatar"
    />
  )
}

// Card Skeleton
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <SkeletonAvatar size={40} />
        <div className="skeleton-card-title">
          <Skeleton width="60%" height="16px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <div className="skeleton-card-body">
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}

// Table Row Skeleton
function SkeletonTableRow({ columns = 5 }) {
  return (
    <div className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, idx) => (
        <Skeleton 
          key={idx} 
          width={idx === 0 ? '30%' : '15%'} 
          height="14px"
        />
      ))}
    </div>
  )
}

// Table Skeleton
function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton key={idx} width="80px" height="12px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <SkeletonTableRow key={idx} columns={columns} />
      ))}
    </div>
  )
}

// KPI Card Skeleton
function SkeletonKPICard() {
  return (
    <div className="skeleton-kpi-card">
      <div className="skeleton-kpi-header">
        <Skeleton width="40px" height="40px" borderRadius="10px" />
        <Skeleton width="24px" height="24px" borderRadius="4px" />
      </div>
      <Skeleton width="80px" height="32px" className="skeleton-kpi-value" />
      <Skeleton width="60%" height="14px" />
    </div>
  )
}

// Chart Skeleton
function SkeletonChart({ type = 'line' }) {
  if (type === 'pie') {
    return (
      <div className="skeleton-chart skeleton-chart-pie">
        <Skeleton width="200px" height="200px" borderRadius="50%" />
        <div className="skeleton-legend">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton-legend-item">
              <Skeleton width="12px" height="12px" borderRadius="2px" />
              <Skeleton width="60px" height="12px" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="skeleton-chart skeleton-chart-line">
      <div className="skeleton-chart-bars">
        {Array.from({ length: 7 }).map((_, idx) => (
          <Skeleton 
            key={idx} 
            width="30px" 
            height={`${30 + Math.random() * 70}%`}
            borderRadius="4px 4px 0 0"
          />
        ))}
      </div>
      <div className="skeleton-chart-axis">
        {Array.from({ length: 7 }).map((_, idx) => (
          <Skeleton key={idx} width="24px" height="10px" />
        ))}
      </div>
    </div>
  )
}

// List Item Skeleton
function SkeletonListItem() {
  return (
    <div className="skeleton-list-item">
      <SkeletonAvatar size={36} />
      <div className="skeleton-list-content">
        <Skeleton width="70%" height="14px" />
        <Skeleton width="40%" height="12px" />
      </div>
      <Skeleton width="60px" height="24px" borderRadius="12px" />
    </div>
  )
}

// List Skeleton
function SkeletonList({ items = 5 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, idx) => (
        <SkeletonListItem key={idx} />
      ))}
    </div>
  )
}

// Dashboard Skeleton
function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-kpi-grid">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonKPICard key={idx} />
        ))}
      </div>
      <div className="skeleton-charts-grid">
        <div className="skeleton-chart-container">
          <Skeleton width="120px" height="20px" className="skeleton-chart-title" />
          <SkeletonChart type="line" />
        </div>
        <div className="skeleton-chart-container">
          <Skeleton width="100px" height="20px" className="skeleton-chart-title" />
          <SkeletonChart type="pie" />
        </div>
      </div>
      <div className="skeleton-activity">
        <Skeleton width="140px" height="20px" className="skeleton-section-title" />
        <SkeletonList items={4} />
      </div>
    </div>
  )
}

// Form Skeleton
function SkeletonForm({ fields = 4 }) {
  return (
    <div className="skeleton-form">
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="skeleton-form-field">
          <Skeleton width="80px" height="12px" className="skeleton-label" />
          <Skeleton width="100%" height="40px" borderRadius="8px" />
        </div>
      ))}
      <div className="skeleton-form-actions">
        <Skeleton width="100px" height="40px" borderRadius="8px" />
        <Skeleton width="100px" height="40px" borderRadius="8px" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonKPICard,
  SkeletonChart,
  SkeletonListItem,
  SkeletonList,
  SkeletonDashboard,
  SkeletonForm
}

export default Skeleton
