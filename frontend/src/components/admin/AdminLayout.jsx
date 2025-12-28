import { useState, useEffect, createContext, useContext } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProSidebar from './ProSidebar'
import AdminHeader from './AdminHeader'
import CommandPalette from './CommandPalette'
import { ScrollProgressLine } from '../animations'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import './AdminLayout.css'

// Admin Layout Context
const AdminLayoutContext = createContext(null)

export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext)
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayout')
  }
  return context
}

function AdminLayout({ children }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarMobileOpen(false)
  }, [location.pathname])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      // Ctrl+B - Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setSidebarMobileOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)
  const toggleMobileSidebar = () => setSidebarMobileOpen(prev => !prev)
  const openCommandPalette = () => setCommandPaletteOpen(true)
  const closeCommandPalette = () => setCommandPaletteOpen(false)

  const contextValue = {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount
  }

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      {/* Scroll Progress Line - sahifa yuqorisida */}
      <ScrollProgressLine />
      
      <div className={`admin-layout-pro ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar */}
        <ProSidebar 
          collapsed={sidebarCollapsed}
          mobileOpen={sidebarMobileOpen}
          onToggle={toggleSidebar}
          onMobileClose={() => setSidebarMobileOpen(false)}
          user={user}
        />

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarMobileOpen && (
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="admin-main-wrapper">
          {/* Header */}
          <AdminHeader 
            onMenuClick={toggleMobileSidebar}
            onSearchClick={openCommandPalette}
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
          />

          {/* Page Content */}
          <main className="admin-content">
            {children || <Outlet />}
          </main>
        </div>

        {/* Command Palette */}
        <CommandPalette 
          isOpen={commandPaletteOpen}
          onClose={closeCommandPalette}
        />
      </div>
    </AdminLayoutContext.Provider>
  )
}

export default AdminLayout
