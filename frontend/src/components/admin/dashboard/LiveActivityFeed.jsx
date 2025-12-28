import { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './LiveActivityFeed.css'

// Activity type configurations
const ACTIVITY_TYPES = {
  attendance: {
    icon: '✓',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    label: 'Davomat'
  },
  payment: {
    icon: '💰',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    label: "To'lov"
  },
  enrollment: {
    icon: '👶',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: "Ro'yxat"
  },
  message: {
    icon: '💬',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    label: 'Xabar'
  },
  event: {
    icon: '📅',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    label: 'Tadbir'
  },
  alert: {
    icon: '⚠️',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'Ogohlantirish'
  },
  system: {
    icon: '⚙️',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    label: 'Tizim'
  }
}

// Format relative time
function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Hozirgina'
  if (minutes < 60) return `${minutes} daqiqa oldin`
  if (hours < 24) return `${hours} soat oldin`
  if (days < 7) return `${days} kun oldin`
  
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'short'
  })
}

// Single Activity Item
const ActivityItem = forwardRef(function ActivityItem({ activity, onClick, isNew }, ref) {
  const config = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.system

  return (
    <motion.div
      ref={ref}
      className={`activity-item ${isNew ? 'activity-item--new' : ''}`}
      onClick={() => onClick?.(activity)}
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ backgroundColor: 'var(--hover-bg)' }}
    >
      <div 
        className="activity-icon"
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color
        }}
      >
        {config.icon}
      </div>
      
      <div className="activity-content">
        <p className="activity-title">{activity.title}</p>
        {activity.description && (
          <p className="activity-description">{activity.description}</p>
        )}
        <div className="activity-meta">
          <span className="activity-type" style={{ color: config.color }}>
            {config.label}
          </span>
          <span className="activity-time">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
      </div>

      {activity.user && (
        <div className="activity-user">
          {activity.user.avatar ? (
            <img 
              src={activity.user.avatar} 
              alt={activity.user.name}
              className="activity-avatar"
            />
          ) : (
            <div className="activity-avatar-placeholder">
              {activity.user.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
})

// Activity Feed Skeleton
function ActivityFeedSkeleton({ count = 5 }) {
  return (
    <div className="activity-feed-skeleton">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="activity-skeleton-item">
          <div className="activity-skeleton-icon" />
          <div className="activity-skeleton-content">
            <div className="activity-skeleton-title" />
            <div className="activity-skeleton-desc" />
            <div className="activity-skeleton-meta" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty State
function EmptyState() {
  return (
    <div className="activity-empty">
      <span className="activity-empty-icon">📭</span>
      <p className="activity-empty-text">Hozircha faoliyat yo'q</p>
      <p className="activity-empty-hint">Yangi faoliyatlar bu yerda ko'rinadi</p>
    </div>
  )
}

// Main LiveActivityFeed Component
function LiveActivityFeed({
  activities = [],
  maxItems = 10,
  loading = false,
  onActivityClick,
  onLoadMore,
  hasMore = false,
  autoRefresh = true,
  refreshInterval = 30000,
  title = "So'nggi faoliyatlar",
  showHeader = true,
  compact = false
}) {
  const [displayedActivities, setDisplayedActivities] = useState([])
  const [newActivityIds, setNewActivityIds] = useState(new Set())
  const containerRef = useRef(null)
  const prevActivitiesRef = useRef([])

  // Update displayed activities when props change
  useEffect(() => {
    const newActivities = activities.slice(0, maxItems)
    
    // Find new activities
    const prevIds = new Set(prevActivitiesRef.current.map(a => a.id))
    const newIds = new Set()
    newActivities.forEach(activity => {
      if (!prevIds.has(activity.id)) {
        newIds.add(activity.id)
      }
    })
    
    setNewActivityIds(newIds)
    setDisplayedActivities(newActivities)
    prevActivitiesRef.current = newActivities

    // Clear "new" status after animation
    if (newIds.size > 0) {
      const timer = setTimeout(() => {
        setNewActivityIds(new Set())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [activities, maxItems])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !hasMore || loading) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore?.()
    }
  }, [hasMore, loading, onLoadMore])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  if (loading && displayedActivities.length === 0) {
    return (
      <div className={`activity-feed ${compact ? 'activity-feed--compact' : ''}`}>
        {showHeader && (
          <div className="activity-feed-header">
            <h3 className="activity-feed-title">{title}</h3>
          </div>
        )}
        <ActivityFeedSkeleton />
      </div>
    )
  }

  return (
    <div className={`activity-feed ${compact ? 'activity-feed--compact' : ''}`}>
      {showHeader && (
        <div className="activity-feed-header">
          <h3 className="activity-feed-title">{title}</h3>
          {autoRefresh && (
            <div className="activity-feed-status">
              <span className="activity-live-dot" />
              <span className="activity-live-text">Jonli</span>
            </div>
          )}
        </div>
      )}

      <div className="activity-feed-content" ref={containerRef}>
        {displayedActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onClick={onActivityClick}
                isNew={newActivityIds.has(activity.id)}
              />
            ))}
          </AnimatePresence>
        )}

        {loading && displayedActivities.length > 0 && (
          <div className="activity-loading-more">
            <div className="activity-spinner" />
            <span>Yuklanmoqda...</span>
          </div>
        )}

        {hasMore && !loading && (
          <button 
            className="activity-load-more"
            onClick={onLoadMore}
          >
            Ko'proq ko'rish
          </button>
        )}
      </div>
    </div>
  )
}

// Filter Tabs Component
export function ActivityFilterTabs({ activeFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'Barchasi' },
    { value: 'attendance', label: 'Davomat' },
    { value: 'payment', label: "To'lov" },
    { value: 'message', label: 'Xabarlar' },
    { value: 'alert', label: 'Ogohlantirishlar' }
  ]

  return (
    <div className="activity-filter-tabs">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`activity-filter-tab ${activeFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default LiveActivityFeed
export { ActivityItem, ActivityFeedSkeleton, ACTIVITY_TYPES }
