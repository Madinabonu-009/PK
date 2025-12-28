import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import './InteractiveCalendar.css';

const DAYS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const InteractiveCalendar = ({ events: propEvents, onDateSelect, editable = false }) => {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState(propEvents || []);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Helper: get localized text
  const getLocalizedText = (text) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[language] || text.uz || text.ru || text.en || '';
  };

  useEffect(() => {
    if (!propEvents) {
      loadEvents();
    }
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (error) {
      // Error handled by UI state
    }
  };

  // Oyning kunlarini olish
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Haftaning qaysi kunidan boshlanadi (0 = Yakshanba)
    let startDay = firstDay.getDay();
    // Dushanbadan boshlash uchun
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const days = [];
    
    // Oldingi oyning kunlari
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Joriy oyning kunlari
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Keyingi oyning kunlari
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  // Kun uchun eventlarni olish
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  // Bugunmi?
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Oy o'zgartirish
  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  // Kun tanlash
  const handleDateClick = (dayInfo) => {
    setSelectedDate(dayInfo.date);
    if (onDateSelect) {
      onDateSelect(dayInfo.date);
    }
    
    const dayEvents = getEventsForDate(dayInfo.date);
    if (dayEvents.length > 0 || editable) {
      setShowEventModal(true);
    }
  };

  // Event turi bo'yicha rang
  const getEventColor = (type) => {
    const colors = {
      holiday: '#ef4444',
      birthday: '#f59e0b',
      event: '#8b5cf6',
      meeting: '#06b6d4',
      activity: '#22c55e',
      default: '#6366f1'
    };
    return colors[type] || colors.default;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="interactive-calendar">
      {/* Header */}
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => changeMonth(-1)}
        >
          ←
        </button>
        <h3>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          className="nav-btn"
          onClick={() => changeMonth(1)}
        >
          →
        </button>
      </div>

      {/* Days of week */}
      <div className="calendar-weekdays">
        {DAYS.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const isSelected = selectedDate?.toDateString() === dayInfo.date.toDateString();
          const isHovered = hoveredDate?.toDateString() === dayInfo.date.toDateString();
          
          return (
            <motion.div
              key={index}
              className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday(dayInfo.date) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(dayInfo)}
              onMouseEnter={() => setHoveredDate(dayInfo.date)}
              onMouseLeave={() => setHoveredDate(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="day-number">{dayInfo.day}</span>
              
              {/* Event dots */}
              {dayEvents.length > 0 && (
                <div className="event-dots">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <span 
                      key={i}
                      className="event-dot"
                      style={{ background: getEventColor(event.type) }}
                    />
                  ))}
                </div>
              )}

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHovered && dayEvents.length > 0 && (
                  <motion.div
                    className="day-tooltip"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    {dayEvents.map((event, i) => (
                      <div key={i} className="tooltip-event">
                        <span 
                          className="tooltip-dot"
                          style={{ background: getEventColor(event.type) }}
                        />
                        <span>{getLocalizedText(event.title)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming events */}
      <div className="upcoming-events">
        <h4>📅 Yaqinlashayotgan tadbirlar</h4>
        <div className="events-list">
          {events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
            .map((event, i) => (
              <motion.div
                key={i}
                className="event-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div 
                  className="event-color"
                  style={{ background: getEventColor(event.type) }}
                />
                <div className="event-info">
                  <span className="event-title">{getLocalizedText(event.title)}</span>
                  <span className="event-date">
                    {new Date(event.date).toLocaleDateString('uz-UZ', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
            <p className="no-events">Hozircha tadbirlar yo'q</p>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && selectedDate && (
          <motion.div
            className="event-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className="event-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4>
                📅 {selectedDate.toLocaleDateString('uz-UZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h4>
              
              <div className="modal-events">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event, i) => (
                    <div key={i} className="modal-event-item">
                      <span 
                        className="event-type-badge"
                        style={{ background: getEventColor(event.type) }}
                      >
                        {event.type === 'holiday' ? '🎉' : 
                         event.type === 'birthday' ? '🎂' :
                         event.type === 'activity' ? '🎨' : '📌'}
                      </span>
                      <div>
                        <h5>{getLocalizedText(event.title)}</h5>
                        {event.description && <p>{getLocalizedText(event.description)}</p>}
                        {event.time && <span className="event-time">⏰ {event.time}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-events">Bu kunda tadbirlar yo'q</p>
                )}
              </div>
              
              <button 
                className="modal-close-btn"
                onClick={() => setShowEventModal(false)}
              >
                Yopish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCalendar;
