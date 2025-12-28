import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './CommandPalette.css'

function CommandPalette({ isOpen, onClose }) {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const texts = {
    uz: {
      placeholder: 'Qidirish yoki buyruq kiriting...',
      navigation: 'Navigatsiya',
      actions: 'Tezkor amallar',
      recent: 'So\'nggi',
      noResults: 'Natija topilmadi',
      dashboard: 'Boshqaruv paneli',
      children: 'Bolalar',
      groups: 'Guruhlar',
      attendance: 'Davomat',
      payments: "To'lovlar",
      debts: 'Qarzdorlar',
      enrollments: 'Arizalar',
      menu: 'Menyu',
      events: 'Tadbirlar',
      gallery: 'Galereya',
      messages: 'Xabarlar',
      reports: 'Hisobotlar',
      settings: 'Sozlamalar',
      addChild: 'Yangi bola qo\'shish',
      takeAttendance: 'Davomat olish',
      addPayment: "To'lov qo'shish",
      createEvent: 'Tadbir yaratish',
      sendMessage: 'Xabar yuborish',
    },
    ru: {
      placeholder: 'Поиск или введите команду...',
      navigation: 'Навигация',
      actions: 'Быстрые действия',
      recent: 'Недавние',
      noResults: 'Ничего не найдено',
      dashboard: 'Панель управления',
      children: 'Дети',
      groups: 'Группы',
      attendance: 'Посещаемость',
      payments: 'Платежи',
      debts: 'Должники',
      enrollments: 'Заявки',
      menu: 'Меню',
      events: 'Мероприятия',
      gallery: 'Галерея',
      messages: 'Сообщения',
      reports: 'Отчеты',
      settings: 'Настройки',
      addChild: 'Добавить ребенка',
      takeAttendance: 'Отметить посещаемость',
      addPayment: 'Добавить платеж',
      createEvent: 'Создать мероприятие',
      sendMessage: 'Отправить сообщение',
    },
    en: {
      placeholder: 'Search or type a command...',
      navigation: 'Navigation',
      actions: 'Quick Actions',
      recent: 'Recent',
      noResults: 'No results found',
      dashboard: 'Dashboard',
      children: 'Children',
      groups: 'Groups',
      attendance: 'Attendance',
      payments: 'Payments',
      debts: 'Debts',
      enrollments: 'Enrollments',
      menu: 'Menu',
      events: 'Events',
      gallery: 'Gallery',
      messages: 'Messages',
      reports: 'Reports',
      settings: 'Settings',
      addChild: 'Add new child',
      takeAttendance: 'Take attendance',
      addPayment: 'Add payment',
      createEvent: 'Create event',
      sendMessage: 'Send message',
    }
  }

  const txt = texts[language] || texts.uz

  // All commands
  const commands = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', label: txt.dashboard, icon: '📊', category: 'navigation', action: () => navigate('/admin/dashboard') },
    { id: 'nav-children', label: txt.children, icon: '👶', category: 'navigation', action: () => navigate('/admin/children') },
    { id: 'nav-groups', label: txt.groups, icon: '👥', category: 'navigation', action: () => navigate('/admin/groups') },
    { id: 'nav-attendance', label: txt.attendance, icon: '✅', category: 'navigation', action: () => navigate('/admin/attendance') },
    { id: 'nav-payments', label: txt.payments, icon: '💳', category: 'navigation', action: () => navigate('/admin/payments') },
    { id: 'nav-debts', label: txt.debts, icon: '💰', category: 'navigation', action: () => navigate('/admin/debts') },
    { id: 'nav-enrollments', label: txt.enrollments, icon: '📋', category: 'navigation', action: () => navigate('/admin/enrollments') },
    { id: 'nav-menu', label: txt.menu, icon: '🍽️', category: 'navigation', action: () => navigate('/admin/menu') },
    { id: 'nav-events', label: txt.events, icon: '📅', category: 'navigation', action: () => navigate('/admin/events') },
    { id: 'nav-gallery', label: txt.gallery, icon: '🖼️', category: 'navigation', action: () => navigate('/admin/gallery') },
    { id: 'nav-messages', label: txt.messages, icon: '💬', category: 'navigation', action: () => navigate('/admin/chat') },
    { id: 'nav-reports', label: txt.reports, icon: '📈', category: 'navigation', action: () => navigate('/admin/daily-reports') },
    { id: 'nav-settings', label: txt.settings, icon: '⚙️', category: 'navigation', action: () => navigate('/admin/settings') },
    // Actions
    { id: 'act-add-child', label: txt.addChild, icon: '➕', category: 'actions', shortcut: 'Ctrl+N', action: () => navigate('/admin/children?action=add') },
    { id: 'act-attendance', label: txt.takeAttendance, icon: '✓', category: 'actions', shortcut: 'Ctrl+A', action: () => navigate('/admin/attendance') },
    { id: 'act-payment', label: txt.addPayment, icon: '💵', category: 'actions', action: () => navigate('/admin/payments?action=add') },
    { id: 'act-event', label: txt.createEvent, icon: '📅', category: 'actions', action: () => navigate('/admin/events?action=add') },
    { id: 'act-message', label: txt.sendMessage, icon: '✉️', category: 'actions', action: () => navigate('/admin/chat?action=new') },
  ], [txt, navigate])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const lowerQuery = query.toLowerCase()
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.icon.includes(query)
    )
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {}
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (command) => {
    command.action()
    onClose()
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'navigation': return txt.navigation
      case 'actions': return txt.actions
      case 'recent': return txt.recent
      default: return category
    }
  }

  let flatIndex = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="command-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input */}
            <div className="command-input-wrapper">
              <span className="command-search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                className="command-input"
                placeholder={txt.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="command-close" onClick={onClose}>
                <span>ESC</span>
              </button>
            </div>

            {/* Results */}
            <div className="command-results">
              {filteredCommands.length === 0 ? (
                <div className="command-empty">
                  <span className="command-empty-icon">🔎</span>
                  <span>{txt.noResults}</span>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => (
                  <div key={category} className="command-group">
                    <div className="command-group-label">{getCategoryLabel(category)}</div>
                    {items.map((cmd) => {
                      flatIndex++
                      const isSelected = flatIndex === selectedIndex
                      return (
                        <button
                          key={cmd.id}
                          className={`command-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(cmd)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                        >
                          <span className="command-item-icon">{cmd.icon}</span>
                          <span className="command-item-label">{cmd.label}</span>
                          {cmd.shortcut && (
                            <span className="command-item-shortcut">{cmd.shortcut}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="command-footer">
              <span className="command-hint">
                <kbd>↑↓</kbd> navigatsiya
              </span>
              <span className="command-hint">
                <kbd>↵</kbd> tanlash
              </span>
              <span className="command-hint">
                <kbd>esc</kbd> yopish
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
