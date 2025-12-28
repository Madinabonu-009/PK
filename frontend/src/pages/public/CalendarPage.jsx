import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './CalendarPage.css'

const TEXTS = {
  uz: {
    title: '📅 Kalendar',
    subtitle: 'Tadbirlar, bayramlar va muhim sanalar',
    holiday: 'Bayram',
    event: 'Tadbir',
    important: 'Muhim',
    noEvents: "Bu oyda tadbirlar yo'q",
    close: 'Yopish',
    time: 'Vaqt'
  },
  ru: {
    title: '📅 Календарь',
    subtitle: 'Мероприятия, праздники и важные даты',
    holiday: 'Праздник',
    event: 'Мероприятие',
    important: 'Важное',
    noEvents: 'В этом месяце нет мероприятий',
    close: 'Закрыть',
    time: 'Время'
  },
  en: {
    title: '📅 Calendar',
    subtitle: 'Events, holidays and important dates',
    holiday: 'Holiday',
    event: 'Event',
    important: 'Important',
    noEvents: 'No events this month',
    close: 'Close',
    time: 'Time'
  }
}

const MONTHS = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}

const WEEKDAYS = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

const CalendarPage = () => {
  const { language } = useLanguage()
  const txt = TEXTS[language]
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    let isMounted = true
    
    const loadEvents = async () => {
      if (isMounted) {
        await fetchEvents()
      }
    }
    
    loadEvents()
    
    return () => {
      isMounted = false
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events')
      // API may return { data: [...] } or array directly
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = (firstDay.getDay() + 6) % 7
    const days = []
    
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayEvents = events.filter(e => e.date === dateStr)
      days.push({ 
        day: i, isCurrentMonth: true, date: dateStr, events: dayEvents,
        isToday: new Date().toDateString() === new Date(year, month, i).toDateString()
      })
    }
    return days
  }

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'holiday': return '#22c55e'
      case 'event': return '#3b82f6'
      case 'important': return '#ef4444'
      default: return '#667eea'
    }
  }

  const getEventTitle = (event) => {
    return typeof event.title === 'object' ? (event.title[language] || event.title.uz) : event.title
  }

  const getEventDescription = (event) => {
    if (!event.description) return ''
    return typeof event.description === 'object' ? (event.description[language] || event.description.uz) : event.description
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="calendar-page">
      <section className="calendar-hero">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>{txt.title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{txt.subtitle}</motion.p>
        </div>
      </section>

      <section className="calendar-content">
        <div className="container">
          <motion.div className="event-legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /><span>{txt.holiday}</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} /><span>{txt.event}</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /><span>{txt.important}</span></div>
          </motion.div>

          <motion.div className="calendar-wrapper" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => changeMonth(-1)}>←</button>
              <h2>{MONTHS[language][currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button className="nav-btn" onClick={() => changeMonth(1)}>→</button>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS[language].map(day => (<div key={day} className="weekday">{day}</div>))}
            </div>

            <div className="calendar-days">
              {days.map((dayObj, index) => (
                <div key={index} className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${dayObj.isToday ? 'today' : ''} ${dayObj.events?.length ? 'has-events' : ''}`}
                  onClick={() => dayObj.events?.length && setSelectedEvent(dayObj.events[0])}>
                  {dayObj.day && (
                    <>
                      <span className="day-number">{dayObj.day}</span>
                      {dayObj.events?.length > 0 && (
                        <div className="day-events">
                          {dayObj.events.slice(0, 2).map(event => (
                            <div key={event.id} className="day-event" style={{ background: getEventColor(event.type) }} title={getEventTitle(event)} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="upcoming-events" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3>📌 {language === 'uz' ? 'Yaqinlashayotgan tadbirlar' : language === 'ru' ? 'Предстоящие события' : 'Upcoming Events'}</h3>
            <div className="events-list">
              {events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).map(event => (
                <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
                  <div className="event-date-badge" style={{ background: getEventColor(event.type) }}>
                    <span className="event-day">{new Date(event.date).getDate()}</span>
                    <span className="event-month">{MONTHS[language][new Date(event.date).getMonth()].slice(0, 3)}</span>
                  </div>
                  <div className="event-info">
                    <h4>{getEventTitle(event)}</h4>
                    <p>{getEventDescription(event).slice(0, 60)}...</p>
                    {event.time && <span className="event-time">🕐 {event.time}</span>}
                  </div>
                </div>
              ))}
              {events.filter(e => new Date(e.date) >= new Date()).length === 0 && <p className="no-events">{txt.noEvents}</p>}
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="event-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)}>
            <motion.div className="event-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ background: getEventColor(selectedEvent.type) }}>
                <span className="modal-type">{selectedEvent.type === 'holiday' ? '🎉' : selectedEvent.type === 'important' ? '⚠️' : '📅'} {txt[selectedEvent.type] || txt.event}</span>
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              <div className="modal-body">
                <h2>{getEventTitle(selectedEvent)}</h2>
                <div className="modal-date">📅 {new Date(selectedEvent.date).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                {selectedEvent.time && <div className="modal-time">🕐 {txt.time}: {selectedEvent.time}</div>}
                <p className="modal-description">{getEventDescription(selectedEvent)}</p>
              </div>
              <div className="modal-footer"><button className="modal-btn" onClick={() => setSelectedEvent(null)}>{txt.close}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CalendarPage