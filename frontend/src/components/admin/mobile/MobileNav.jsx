import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MobileNav.css'

// Navigation Items
const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Bosh sahifa', path: '/admin' },
  { id: 'children', icon: '👶', label: 'Bolalar', path: '/admin/children' },
  { id: 'attendance', icon: '📋', label: 'Davomat', path: '/admin/attendance' },
  { id: 'finance', icon: '💰', label: 'Moliya', path: '/admin/finance' },
  { id: 'more', icon: '⋯', label: "Ko'proq", path: null }
]

// More Menu Items
const MORE_ITEMS = [
  { id: 'groups', icon: '👥', label: 'Guruhlar', path: '/admin/groups' },
  { id: 'calendar', icon: '📅', label: 'Kalendar', path: '/admin/calendar' },
  { id: 'messages', icon: '💬', label: 'Xabarlar', path: '/admin/messages' },
  { id: 'reports', icon: '📊', label: 'Hisobotlar', path: '/admin/reports' },
  { id: 'settings', icon: '⚙️', label: 'Sozlamalar', path: '/admin/settings' }
]

// Bottom Tab Bar
function BottomTabBar({ activeTab, onTabChange, unreadCount = 0 }) {
  const [showMore, setShowMore] = useState(false)

  const handleTabClick = (item) => {
    if (item.id === 'more') {
      setShowMore(!showMore)
    } else {
      setShowMore(false)
      onTabChange?.(item)
    }
  }

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              className="more-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              className="more-menu"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="more-menu-header">
                <span>Boshqa bo'limlar</span>
                <button onClick={() => setShowMore(false)}>✕</button>
              </div>
              <div className="more-menu-grid">
                {MORE_ITEMS.map(item => (
                  <button
                    key={item.id}
                    className={`more-menu-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange?.(item)
                      setShowMore(false)
                    }}
                  >
                    <span className="more-item-icon">{item.icon}</span>
                    <span className="more-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav className="bottom-tab-bar">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`tab-item ${activeTab === item.id ? 'active' : ''} ${showMore && item.id === 'more' ? 'active' : ''}`}
            onClick={() => handleTabClick(item)}
          >
            <span className="tab-icon">
              {item.icon}
              {item.id === 'messages' && unreadCount > 0 && (
                <span className="tab-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </span>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

// Pull to Refresh
function PullToRefresh({ onRefresh, children, threshold = 80 }) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
      setPulling(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!pulling) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    setPullDistance(Math.min(distance, threshold * 1.5))
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      await onRefresh?.()
      setRefreshing(false)
    }
    setPulling(false)
    setPullDistance(0)
  }

  const progress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={`pull-indicator ${refreshing ? 'refreshing' : ''}`}
        style={{ 
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: progress
        }}
      >
        <motion.div
          className="pull-spinner"
          animate={refreshing ? { rotate: 360 } : { rotate: progress * 180 }}
          transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          🔄
        </motion.div>
        <span className="pull-text">
          {refreshing ? 'Yangilanmoqda...' : progress >= 1 ? "Qo'yib yuboring" : 'Yangilash uchun torting'}
        </span>
      </div>
      <div 
        className="pull-content"
        style={{ transform: `translateY(${pullDistance * 0.5}px)` }}
      >
        {children}
      </div>
    </div>
  )
}

// Swipe Actions
function SwipeActions({ 
  children, 
  leftActions = [], 
  rightActions = [],
  onSwipeLeft,
  onSwipeRight 
}) {
  const [offset, setOffset] = useState(0)
  const [startX, setStartX] = useState(0)
  const [swiping, setSwiping] = useState(false)

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    
    // Limit swipe distance
    const maxLeft = leftActions.length > 0 ? 100 : 0
    const maxRight = rightActions.length > 0 ? -100 : 0
    
    setOffset(Math.max(maxRight, Math.min(maxLeft, diff)))
  }

  const handleTouchEnd = () => {
    setSwiping(false)
    
    if (offset > 60 && leftActions.length > 0) {
      onSwipeLeft?.()
    } else if (offset < -60 && rightActions.length > 0) {
      onSwipeRight?.()
    }
    
    setOffset(0)
  }

  return (
    <div className="swipe-container">
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="swipe-actions left" style={{ opacity: offset / 100 }}>
          {leftActions.map((action, idx) => (
            <button
              key={idx}
              className={`swipe-action ${action.type || ''}`}
              onClick={action.onClick}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="swipe-content"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="swipe-actions right" style={{ opacity: -offset / 100 }}>
          {rightActions.map((action, idx) => (
            <button
              key={idx}
              className={`swipe-action ${action.type || ''}`}
              onClick={action.onClick}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile Header
function MobileHeader({ title, onBack, actions = [] }) {
  return (
    <header className="mobile-header">
      {onBack && (
        <button className="mobile-back-btn" onClick={onBack}>
          ←
        </button>
      )}
      <h1 className="mobile-title">{title}</h1>
      <div className="mobile-actions">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="mobile-action-btn"
            onClick={action.onClick}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </header>
  )
}

// Floating Action Button
function FloatingActionButton({ icon = '➕', onClick, label }) {
  return (
    <motion.button
      className="fab"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={label}
    >
      {icon}
    </motion.button>
  )
}

// Install PWA Prompt
function InstallPrompt({ onInstall, onDismiss }) {
  return (
    <motion.div
      className="install-prompt"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
    >
      <div className="install-content">
        <span className="install-icon">📱</span>
        <div className="install-text">
          <h4>Ilovani o'rnating</h4>
          <p>Tezroq kirish uchun bosh ekranga qo'shing</p>
        </div>
      </div>
      <div className="install-actions">
        <button className="install-dismiss" onClick={onDismiss}>Keyinroq</button>
        <button className="install-btn" onClick={onInstall}>O'rnatish</button>
      </div>
    </motion.div>
  )
}

// Offline Indicator
function OfflineIndicator({ isOnline }) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          className="offline-indicator"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <span className="offline-icon">📡</span>
          <span>Internet aloqasi yo'q</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export {
  BottomTabBar,
  PullToRefresh,
  SwipeActions,
  MobileHeader,
  FloatingActionButton,
  InstallPrompt,
  OfflineIndicator,
  NAV_ITEMS,
  MORE_ITEMS
}

export default BottomTabBar
