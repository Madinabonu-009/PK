import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './ActivityTimeline.css'

const ACTIVITY_TYPES = {
  attendance: { icon: '✓', color: '#22c55e', label: 'Davomat' },
  payment: { icon: '💳', color: '#3b82f6', label: "To'lov" },
  medical: { icon: '🏥', color: '#ef4444', label: 'Tibbiy' },
  message: { icon: '💬', color: '#8b5cf6', label: 'Xabar' },
  event: { icon: '📅', color: '#f59e0b', label: 'Tadbir' },
  photo: { icon: '📷', color: '#ec4899', label: 'Rasm' },
  note: { icon: '📝', color: '#6b7280', label: 'Eslatma' },
  group: { icon: '👥', color: '#06b6d4', label: 'Guruh' }
}

export default function ActivityTimeline({ 
  activities = [], 
  childId,
  onLoadMore,
  hasMore = false,
  loading = false
}) {
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities
    return activities.filter(a => a.type === filter)
  }, [activities, filter])

  const groupedByDate = useMemo(() => {
    const groups = {}
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })
    return groups
  }, [filteredActivities])

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Hozirgina"
    if (minutes < 60) return `${minutes} daqiqa oldin`
    if (hours < 24) return `${hours} soat oldin`
    if (days < 7) return `${days} kun oldin`
    return formatTime(timestamp)
  }

  return (
    <div className="activity-timeline">
      <div className="activity-timeline__header">
        <h3 className="activity-timeline__title">Faoliyat tarixi</h3>
        <div className="activity-timeline__filters">
          <button
            className={`activity-timeline__filter ${filter === 'all' ? 'activity-timeline__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Hammasi
          </button>
          {Object.entries(ACTIVITY_TYPES).map(([key, { icon, label }]) => (
            <button
              key={key}
              className={`activity-timeline__filter ${filter === key ? 'activity-timeline__filter--active' : ''}`}
              onClick={() => setFilter(key)}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-timeline__content">
        {Object.entries(groupedByDate).map(([date, dayActivities]) => (
          <div key={date} className="activity-timeline__day">
            <div className="activity-timeline__date">{date}</div>
            <div className="activity-timeline__items">
              {dayActivities.map((activity, index) => {
                const config = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.note
                const isExpanded = expandedId === activity.id
                
                return (
                  <motion.div
                    key={activity.id}
                    className="activity-timeline__item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div 
                      className="activity-timeline__icon"
                      style={{ background: `${config.color}20`, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    
                    <div className="activity-timeline__line" />
                    
                    <div 
                      className="activity-timeline__card"
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                    >
                      <div className="activity-timeline__card-header">
                        <span className="activity-timeline__card-title">{activity.title}</span>
                        <span className="activity-timeline__card-time">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="activity-timeline__card-description">
                        {activity.description}
                      </p>

                      <AnimatePresence>
                        {isExpanded && activity.details && (
                          <motion.div
                            className="activity-timeline__card-details"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            {activity.details.map((detail, i) => (
                              <div key={i} className="activity-timeline__detail">
                                <span className="activity-timeline__detail-label">{detail.label}:</span>
                                <span className="activity-timeline__detail-value">{detail.value}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {activity.user && (
                        <div className="activity-timeline__card-user">
                          <img 
                            src={activity.user.avatar || '/default-avatar.png'} 
                            alt={activity.user.name}
                            className="activity-timeline__user-avatar"
                          />
                          <span className="activity-timeline__user-name">{activity.user.name}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && !loading && (
          <div className="activity-timeline__empty">
            <div className="activity-timeline__empty-icon">📋</div>
            <p>Faoliyat topilmadi</p>
          </div>
        )}

        {loading && (
          <div className="activity-timeline__loading">
            <div className="activity-timeline__spinner" />
          </div>
        )}

        {hasMore && !loading && (
          <button className="activity-timeline__load-more" onClick={onLoadMore}>
            Ko'proq yuklash
          </button>
        )}
      </div>
    </div>
  )
}

ActivityTimeline.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    details: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })),
    user: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  })),
  childId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  loading: PropTypes.bool
}
