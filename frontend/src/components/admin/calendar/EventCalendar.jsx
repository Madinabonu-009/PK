import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EventCalendar.css'

// Event category configurations
const EVENT_CATEGORIES = {
  holiday: { icon: '🎉', label: 'Bayram', color: '#ef4444' },
  celebration: { icon: '🎂', label: 'Tantana', color: '#f59e0b' },
  meeting: { icon: '👥', label: 'Yig\'ilish', color: '#6366f1' },
  activity: { icon: '🎨', label: 'Faoliyat', color: '#22c55e' },
  deadline: { icon: '⏰', label: 'Muddat', color: '#dc2626' },
  other: { icon: '📌', label: 'Boshqa', color: '#6b7280' }
}

// Days of week
const DAYS_OF_WEEK = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
]

// Helper functions
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

function isToday(date) {
  return isSameDay(date, new Date())
}

// Event Badge
export function EventBadge({ event, compact = false }) {
  const category = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.other

  if (compact) {
    return (
      <div 
        className="event-badge event-badge--compact"
        style={{ backgroundColor: category.color }}
        title={event.title}
      />
    )
  }

  return (
    <div 
      className="event-badge"
      style={{ 
        backgroundColor: category.color + '20',
        borderLeftColor: category.color
      }}
    >
      <span className="event-badge-icon">{category.icon}</span>
      <span className="event-badge-title">{event.title}</span>
    </div>
  )
}

// Calendar Day Cell
function CalendarDay({ 
  date, 
  events = [], 
  isCurrentMonth, 
  isSelected, 
  onClick,
  onEventClick 
}) {
  const dayEvents = events.filter(e => isSameDay(new Date(e.start), date))
  const today = isToday(date)

  return (
    <div 
      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${today ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick?.(date)}
    >
      <span className="calendar-day-number">{date.getDate()}</span>
      
      <div className="calendar-day-events">
        {dayEvents.slice(0, 3).map((event, index) => (
          <EventBadge 
            key={event.id || index} 
            event={event} 
            compact={dayEvents.length > 2}
          />
        ))}
        {dayEvents.length > 3 && (
          <span className="calendar-day-more">+{dayEvents.length - 3}</span>
        )}
      </div>
    </div>
  )
}

// Month View
function MonthView({ 
  year, 
  month, 
  events, 
  selectedDate, 
  onDateSelect, 
  onEventClick 
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const days = useMemo(() => {
    const result = []
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    // Next month days
    const remaining = 42 - result.length
    for (let i = 1; i <= remaining; i++) {
      result.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }
    
    return result
  }, [year, month, daysInMonth, firstDay, daysInPrevMonth])

  return (
    <div className="calendar-month-view">
      <div className="calendar-weekdays">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map(({ date, isCurrentMonth }, index) => (
          <CalendarDay
            key={index}
            date={date}
            events={events}
            isCurrentMonth={isCurrentMonth}
            isSelected={selectedDate && isSameDay(date, selectedDate)}
            onClick={onDateSelect}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}

// Event List (Agenda View)
function AgendaView({ events, onEventClick }) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start) - new Date(b.start)
  )

  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.start).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(event)
    return groups
  }, {})

  return (
    <div className="calendar-agenda-view">
      {Object.entries(groupedEvents).map(([dateStr, dayEvents]) => {
        const date = new Date(dateStr)
        return (
          <div key={dateStr} className="agenda-day">
            <div className="agenda-day-header">
              <span className="agenda-day-date">{date.getDate()}</span>
              <span className="agenda-day-name">
                {date.toLocaleDateString('uz-UZ', { weekday: 'long', month: 'long' })}
              </span>
            </div>
            <div className="agenda-day-events">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className="agenda-event"
                  onClick={() => onEventClick?.(event)}
                >
                  <div 
                    className="agenda-event-indicator"
                    style={{ backgroundColor: EVENT_CATEGORIES[event.category]?.color }}
                  />
                  <div className="agenda-event-content">
                    <span className="agenda-event-time">
                      {new Date(event.start).toLocaleTimeString('uz-UZ', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className="agenda-event-title">{event.title}</span>
                    {event.description && (
                      <span className="agenda-event-desc">{event.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {Object.keys(groupedEvents).length === 0 && (
        <div className="agenda-empty">
          <span className="agenda-empty-icon">📅</span>
          <p>Tadbirlar yo'q</p>
        </div>
      )}
    </div>
  )
}

// Main Event Calendar Component
function EventCalendar({
  events = [],
  view = 'month', // month, week, agenda
  onViewChange,
  onDateSelect,
  onEventClick,
  onCreateEvent,
  selectedDate,
  loading = false
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [internalView, setInternalView] = useState(view)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView) => {
    setInternalView(newView)
    onViewChange?.(newView)
  }

  return (
    <div className="event-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <h2 className="calendar-title">
            {MONTHS[month]} {year}
          </h2>
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={handlePrev}>←</button>
            <button className="calendar-nav-btn today" onClick={handleToday}>Bugun</button>
            <button className="calendar-nav-btn" onClick={handleNext}>→</button>
          </div>
        </div>
        
        <div className="calendar-header-right">
          <div className="calendar-view-toggle">
            {['month', 'agenda'].map(v => (
              <button
                key={v}
                className={`view-toggle-btn ${internalView === v ? 'active' : ''}`}
                onClick={() => handleViewChange(v)}
              >
                {v === 'month' ? '📅 Oy' : '📋 Ro\'yxat'}
              </button>
            ))}
          </div>
          
          {onCreateEvent && (
            <button className="calendar-add-btn" onClick={onCreateEvent}>
              + Tadbir qo'shish
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="calendar-content">
        {loading ? (
          <div className="calendar-loading">
            <div className="calendar-spinner" />
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={internalView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {internalView === 'month' ? (
                <MonthView
                  year={year}
                  month={month}
                  events={events}
                  selectedDate={selectedDate}
                  onDateSelect={onDateSelect}
                  onEventClick={onEventClick}
                />
              ) : (
                <AgendaView
                  events={events.filter(e => {
                    const eventDate = new Date(e.start)
                    return eventDate.getMonth() === month && eventDate.getFullYear() === year
                  })}
                  onEventClick={onEventClick}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        {Object.entries(EVENT_CATEGORIES).slice(0, 4).map(([key, config]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: config.color }} />
            <span className="legend-label">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventCalendar
export { MonthView, AgendaView, EVENT_CATEGORIES, MONTHS }
