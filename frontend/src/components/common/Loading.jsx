import React from 'react'
import PropTypes from 'prop-types'
import './Loading.css'

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`loading-spinner loading-spinner-${size} loading-spinner-${color}`}>
      <div className="spinner"></div>
    </div>
  )
}

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({ message = 'Yuklanmoqda...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <LoadingSpinner size="large" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  )
}

/**
 * Skeleton loader for content
 */
export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{
            width,
            height,
            borderRadius,
            marginBottom: count > 1 ? '8px' : '0'
          }}
        />
      ))}
    </>
  )
}

/**
 * Card skeleton loader
 */
export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <Skeleton height="200px" borderRadius="12px" />
      <div className="skeleton-card-content">
        <Skeleton height="24px" width="80%" />
        <Skeleton height="16px" width="100%" count={2} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <Skeleton height="32px" width="80px" borderRadius="16px" />
          <Skeleton height="32px" width="80px" borderRadius="16px" />
        </div>
      </div>
    </div>
  )
}

/**
 * Table skeleton loader
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      {/* Header */}
      <div className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="40px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="48px" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Inline loading indicator
 */
export const InlineLoading = ({ text = 'Yuklanmoqda' }) => {
  return (
    <div className="inline-loading">
      <div className="inline-loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="inline-loading-text">{text}</span>
    </div>
  )
}

/**
 * Progress bar
 */
export const ProgressBar = ({ progress = 0, showLabel = true }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{Math.round(progress)}%</span>
      )}
    </div>
  )
}

// PropTypes
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white'])
}

LoadingOverlay.propTypes = {
  message: PropTypes.string
}

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  count: PropTypes.number
}

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
}

InlineLoading.propTypes = {
  text: PropTypes.string
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  showLabel: PropTypes.bool
}

export default LoadingSpinner
