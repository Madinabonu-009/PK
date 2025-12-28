import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import './AttendanceHeatmap.css'

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

export default function AttendanceHeatmap({ 
  data = [], 
  year = new Date().getFullYear(),
  onDayClick,
  childId = null
}) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const calendarData = useMemo(() => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    const weeks = []
    let currentWeek = []
    
    // Fill empty days at start
    const startDay = startDate.getDay() || 7
    for (let i = 1; i < startDay; i++) {
      currentWeek.push(null)
    }

    // Create data map for quick lookup
    const dataMap = new Map()
    data.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0]
      dataMap.set(dateKey, item)
    })

    // Fill calendar
    const current = new Date(startDate)
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0]
      const dayData = dataMap.get(dateKey)
      
      currentWeek.push({
        date: new Date(current),
        dateKey,
        attendance: dayData?.attendance || 0,
        total: dayData?.total || 0,
        present: dayData?.present || 0,
        absent: dayData?.absent || 0,
        late: dayData?.late || 0,
        status: dayData?.status // For individual child view
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      current.setDate(current.getDate() + 1)
    }

    // Fill remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [data, year])

  const getIntensity = (day) => {
    if (!day || day.total === 0) return 0
    if (childId) {
      // Individual child view
      if (day.status === 'present') return 4
      if (day.status === 'late') return 3
      if (day.status === 'absent') return 1
      return 0
    }
    // Group view - percentage based
    const percentage = (day.present / day.total) * 100
    if (percentage >= 90) return 4
    if (percentage >= 75) return 3
    if (percentage >= 50) return 2
    if (percentage > 0) return 1
    return 0
  }

  const handleDayHover = (day, event) => {
    if (!day) return
    const rect = event.target.getBoundingClientRect()
    setTooltip({
      day,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleDayClick = (day) => {
    if (!day) return
    setSelectedDay(day.dateKey)
    onDayClick?.(day)
  }

  const monthLabels = useMemo(() => {
    const labels = []
    let currentMonth = -1
    
    calendarData.forEach((week, weekIndex) => {
      const firstDay = week.find(d => d !== null)
      if (firstDay) {
        const month = firstDay.date.getMonth()
        if (month !== currentMonth) {
          labels.push({ month, weekIndex })
          currentMonth = month
        }
      }
    })
    
    return labels
  }, [calendarData])

  return (
    <div className="attendance-heatmap">
      <div className="attendance-heatmap__header">
        <h3 className="attendance-heatmap__title">
          {childId ? 'Davomat tarixi' : 'Yillik davomat'}
        </h3>
        <div className="attendance-heatmap__year">{year}</div>
      </div>

      <div className="attendance-heatmap__container">
        <div className="attendance-heatmap__days">
          {DAYS.map((day, i) => (
            <div key={i} className="attendance-heatmap__day-label">{day}</div>
          ))}
        </div>

        <div className="attendance-heatmap__grid">
          <div className="attendance-heatmap__months">
            {monthLabels.map(({ month, weekIndex }) => (
              <div 
                key={month} 
                className="attendance-heatmap__month-label"
                style={{ gridColumn: weekIndex + 1 }}
              >
                {MONTHS[month]}
              </div>
            ))}
          </div>

          <div className="attendance-heatmap__weeks">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="attendance-heatmap__week">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    className={`attendance-heatmap__cell attendance-heatmap__cell--${getIntensity(day)} ${
                      day?.dateKey === selectedDay ? 'attendance-heatmap__cell--selected' : ''
                    } ${!day ? 'attendance-heatmap__cell--empty' : ''}`}
                    whileHover={{ scale: day ? 1.3 : 1 }}
                    onMouseEnter={(e) => handleDayHover(day, e)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => handleDayClick(day)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="attendance-heatmap__legend">
        <span className="attendance-heatmap__legend-label">Kam</span>
        <div className="attendance-heatmap__legend-cells">
          {[0, 1, 2, 3, 4].map(level => (
            <div 
              key={level} 
              className={`attendance-heatmap__legend-cell attendance-heatmap__cell--${level}`}
            />
          ))}
        </div>
        <span className="attendance-heatmap__legend-label">Ko'p</span>
      </div>

      {tooltip && (
        <div 
          className="attendance-heatmap__tooltip"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="attendance-heatmap__tooltip-date">
            {tooltip.day.date.toLocaleDateString('uz-UZ', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
          {childId ? (
            <div className="attendance-heatmap__tooltip-status">
              {tooltip.day.status === 'present' && '✓ Kelgan'}
              {tooltip.day.status === 'late' && '⏰ Kech kelgan'}
              {tooltip.day.status === 'absent' && '✕ Kelmagan'}
            </div>
          ) : (
            <>
              <div className="attendance-heatmap__tooltip-stat">
                Kelgan: {tooltip.day.present}/{tooltip.day.total}
              </div>
              {tooltip.day.late > 0 && (
                <div className="attendance-heatmap__tooltip-stat">
                  Kech: {tooltip.day.late}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

AttendanceHeatmap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    attendance: PropTypes.number,
    total: PropTypes.number,
    present: PropTypes.number,
    absent: PropTypes.number,
    late: PropTypes.number,
    status: PropTypes.string
  })),
  year: PropTypes.number,
  onDayClick: PropTypes.func,
  childId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}
