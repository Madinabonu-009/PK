import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import './GroupDetail.css'

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export default function GroupDetail({ 
  group,
  children = [],
  schedule = [],
  onChildClick,
  onEditSchedule,
  onAddChild,
  onRemoveChild
}) {
  const [activeTab, setActiveTab] = useState('children')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChildren = useMemo(() => {
    if (!searchQuery) return children
    const query = searchQuery.toLowerCase()
    return children.filter(child => 
      child.name.toLowerCase().includes(query)
    )
  }, [children, searchQuery])

  const capacityPercentage = (children.length / group.capacity) * 100
  const capacityStatus = capacityPercentage >= 100 ? 'full' : capacityPercentage >= 80 ? 'warning' : 'normal'

  return (
    <div className="group-detail">
      <div className="group-detail__header" style={{ borderColor: group.color }}>
        <div className="group-detail__info">
          <div 
            className="group-detail__avatar"
            style={{ background: `${group.color}20`, color: group.color }}
          >
            {group.name.charAt(0)}
          </div>
          <div>
            <h2 className="group-detail__name">{group.name}</h2>
            <p className="group-detail__meta">
              {group.ageRange} yosh • {children.length}/{group.capacity} bola
            </p>
          </div>
        </div>

        <div className="group-detail__capacity">
          <div className="group-detail__capacity-bar">
            <div 
              className={`group-detail__capacity-fill group-detail__capacity-fill--${capacityStatus}`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          <span className="group-detail__capacity-text">
            {capacityPercentage.toFixed(0)}% to'lgan
          </span>
        </div>
      </div>

      <div className="group-detail__teachers">
        <h4 className="group-detail__section-title">Tarbiyachilar</h4>
        <div className="group-detail__teachers-list">
          {group.teachers?.map(teacher => (
            <div key={teacher.id} className="group-detail__teacher">
              <img 
                src={teacher.avatar || '/default-avatar.png'} 
                alt={teacher.name}
                className="group-detail__teacher-avatar"
              />
              <div className="group-detail__teacher-info">
                <span className="group-detail__teacher-name">{teacher.name}</span>
                <span className="group-detail__teacher-role">{teacher.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="group-detail__tabs">
        <button
          className={`group-detail__tab ${activeTab === 'children' ? 'group-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          👶 Bolalar ({children.length})
        </button>
        <button
          className={`group-detail__tab ${activeTab === 'schedule' ? 'group-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Jadval
        </button>
      </div>

      {activeTab === 'children' && (
        <div className="group-detail__children">
          <div className="group-detail__children-header">
            <input
              type="text"
              className="group-detail__search"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {capacityStatus !== 'full' && (
              <button className="group-detail__add-btn" onClick={onAddChild}>
                + Bola qo'shish
              </button>
            )}
          </div>

          <div className="group-detail__children-grid">
            {filteredChildren.map((child, index) => (
              <motion.div
                key={child.id}
                className="group-detail__child"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onChildClick?.(child)}
              >
                <img 
                  src={child.photo || '/default-avatar.png'} 
                  alt={child.name}
                  className="group-detail__child-photo"
                />
                <div className="group-detail__child-info">
                  <span className="group-detail__child-name">{child.name}</span>
                  <span className="group-detail__child-age">{child.age} yosh</span>
                </div>
                <div className="group-detail__child-actions">
                  <button 
                    className="group-detail__child-action"
                    onClick={(e) => { e.stopPropagation(); onRemoveChild?.(child) }}
                    title="Guruhdan chiqarish"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredChildren.length === 0 && (
            <div className="group-detail__empty">
              <p>Bolalar topilmadi</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="group-detail__schedule">
          <div className="group-detail__schedule-header">
            <h4>Haftalik jadval</h4>
            <button className="group-detail__edit-btn" onClick={onEditSchedule}>
              ✏️ Tahrirlash
            </button>
          </div>
          <div className="group-detail__schedule-grid">
            <div className="group-detail__schedule-times">
              <div className="group-detail__schedule-corner" />
              {TIME_SLOTS.map(time => (
                <div key={time} className="group-detail__schedule-time">{time}</div>
              ))}
            </div>
            {DAYS.map(day => (
              <div key={day} className="group-detail__schedule-day">
                <div className="group-detail__schedule-day-name">{day}</div>
                {TIME_SLOTS.map(time => {
                  const event = schedule.find(s => s.day === day && s.time === time)
                  return (
                    <div 
                      key={`${day}-${time}`} 
                      className={`group-detail__schedule-cell ${event ? 'group-detail__schedule-cell--filled' : ''}`}
                      style={event ? { background: `${event.color}20`, borderColor: event.color } : {}}
                    >
                      {event?.title}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

GroupDetail.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    ageRange: PropTypes.string,
    capacity: PropTypes.number.isRequired,
    color: PropTypes.string,
    teachers: PropTypes.array
  }).isRequired,
  children: PropTypes.array,
  schedule: PropTypes.array,
  onChildClick: PropTypes.func,
  onEditSchedule: PropTypes.func,
  onAddChild: PropTypes.func,
  onRemoveChild: PropTypes.func
}
