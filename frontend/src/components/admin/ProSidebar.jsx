import { useState, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import './ProSidebar.css'

// Icons as simple components
const Icons = {
  Dashboard: () => <span className="nav-icon">📊</span>,
  Children: () => <span className="nav-icon">👶</span>,
  Groups: () => <span className="nav-icon">👥</span>,
  Attendance: () => <span className="nav-icon">✅</span>,
  Payments: () => <span className="nav-icon">💳</span>,
  Debts: () => <span className="nav-icon">💰</span>,
  Enrollments: () => <span className="nav-icon">📋</span>,
  Menu: () => <span className="nav-icon">🍽️</span>,
  Events: () => <span className="nav-icon">📅</span>,
  Gallery: () => <span className="nav-icon">🖼️</span>,
  Messages: () => <span className="nav-icon">💬</span>,
  Telegram: () => <span className="nav-icon">📱</span>,
  Reports: () => <span className="nav-icon">📈</span>,
  Users: () => <span className="nav-icon">👤</span>,
  Settings: () => <span className="nav-icon">⚙️</span>,
  Logout: () => <span className="nav-icon">🚪</span>,
  Collapse: () => <span className="nav-icon">◀</span>,
  Expand: () => <span className="nav-icon">▶</span>,
  Close: () => <span className="nav-icon">✕</span>,
  ChevronDown: () => <span className="nav-icon chevron">▼</span>,
  ChevronRight: () => <span className="nav-icon chevron">▶</span>,
}

function ProSidebar({ collapsed, mobileOpen, onToggle, onMobileClose, user }) {
  const { t, language } = useLanguage()
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedMenus, setExpandedMenus] = useState({})

  const texts = {
    uz: {
      dashboard: 'Boshqaruv paneli',
      children: 'Bolalar',
      groups: 'Guruhlar',
      attendance: 'Davomat',
      finance: 'Moliya',
      payments: "To'lovlar",
      debts: 'Qarzdorlar',
      enrollments: 'Arizalar',
      menu: 'Menyu',
      events: 'Tadbirlar',
      gallery: 'Galereya',
      messages: 'Xabarlar',
      telegram: 'Telegram',
      reports: 'Hisobotlar',
      dailyReports: 'Kunlik hisobotlar',
      analytics: 'Analitika',
      users: 'Foydalanuvchilar',
      settings: 'Sozlamalar',
      logout: 'Chiqish',
      admin: 'Administrator',
      teacher: "O'qituvchi",
    },
    ru: {
      dashboard: 'Панель управления',
      children: 'Дети',
      groups: 'Группы',
      attendance: 'Посещаемость',
      finance: 'Финансы',
      payments: 'Платежи',
      debts: 'Должники',
      enrollments: 'Заявки',
      menu: 'Меню',
      events: 'Мероприятия',
      gallery: 'Галерея',
      messages: 'Сообщения',
      telegram: 'Телеграм',
      reports: 'Отчеты',
      dailyReports: 'Ежедневные отчеты',
      analytics: 'Аналитика',
      users: 'Пользователи',
      settings: 'Настройки',
      logout: 'Выход',
      admin: 'Администратор',
      teacher: 'Учитель',
    },
    en: {
      dashboard: 'Dashboard',
      children: 'Children',
      groups: 'Groups',
      attendance: 'Attendance',
      finance: 'Finance',
      payments: 'Payments',
      debts: 'Debts',
      enrollments: 'Enrollments',
      menu: 'Menu',
      events: 'Events',
      gallery: 'Gallery',
      messages: 'Messages',
      telegram: 'Telegram',
      reports: 'Reports',
      dailyReports: 'Daily Reports',
      analytics: 'Analytics',
      users: 'Users',
      settings: 'Settings',
      logout: 'Logout',
      admin: 'Administrator',
      teacher: 'Teacher',
    }
  }

  const txt = texts[language] || texts.uz

  // Navigation items
  const navItems = useMemo(() => [
    { id: 'dashboard', label: txt.dashboard, icon: Icons.Dashboard, path: '/admin/dashboard' },
    { id: 'children', label: txt.children, icon: Icons.Children, path: '/admin/children' },
    { id: 'groups', label: txt.groups, icon: Icons.Groups, path: '/admin/groups' },
    { id: 'attendance', label: txt.attendance, icon: Icons.Attendance, path: '/admin/attendance' },
    { 
      id: 'finance', 
      label: txt.finance, 
      icon: Icons.Payments,
      children: [
        { id: 'payments', label: txt.payments, path: '/admin/payments' },
        { id: 'debts', label: txt.debts, path: '/admin/debts' },
      ]
    },
    { id: 'enrollments', label: txt.enrollments, icon: Icons.Enrollments, path: '/admin/enrollments', badge: 3 },
    { id: 'menu', label: txt.menu, icon: Icons.Menu, path: '/admin/menu' },
    { id: 'gallery', label: txt.gallery, icon: Icons.Gallery, path: '/admin/gallery' },
    { id: 'messages', label: txt.messages, icon: Icons.Messages, path: '/admin/chat', badge: 5 },
    { id: 'telegram', label: txt.telegram, icon: Icons.Telegram, path: '/admin/telegram' },
    { 
      id: 'reports', 
      label: txt.reports, 
      icon: Icons.Reports,
      children: [
        { id: 'daily-reports', label: txt.dailyReports, path: '/admin/daily-reports' },
        { id: 'analytics', label: txt.analytics, path: '/admin/analytics' },
      ]
    },
    { id: 'users', label: txt.users, icon: Icons.Users, path: '/admin/users', adminOnly: true },
    { id: 'settings', label: txt.settings, icon: Icons.Settings, path: '/admin/settings' },
  ], [txt])

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }))
  }

  const isActive = (path) => location.pathname === path
  const isParentActive = (item) => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.path)
    }
    return false
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const renderNavItem = (item) => {
    // Skip admin-only items for non-admin users
    if (item.adminOnly && user?.role !== 'admin' && user?.role !== 'superadmin') {
      return null
    }

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedMenus[item.id]
    const active = isActive(item.path) || isParentActive(item)
    const Icon = item.icon

    if (hasChildren) {
      return (
        <div key={item.id} className="nav-item-group">
          <button
            className={`nav-item nav-item-parent ${active ? 'active' : ''}`}
            onClick={() => toggleMenu(item.id)}
          >
            <Icon />
            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                <span className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}>
                  {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                </span>
              </>
            )}
          </button>
          <AnimatePresence>
            {isExpanded && !collapsed && (
              <motion.div
                className="nav-submenu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.children.map(child => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-dot" />
                    <span className="nav-label">{child.label}</span>
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Icon />
        {!collapsed && (
          <>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </>
        )}
        {collapsed && item.badge && <span className="nav-badge-dot" />}
      </NavLink>
    )
  }

  return (
    <aside className={`pro-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="Play Kids" className="logo-image" />
          {!collapsed && <span className="logo-text">Play Kids</span>}
        </div>
        <button className="sidebar-toggle desktop-only" onClick={onToggle}>
          {collapsed ? <Icons.Expand /> : <Icons.Collapse />}
        </button>
        <button className="sidebar-close mobile-only" onClick={onMobileClose}>
          <Icons.Close />
        </button>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'A'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{user?.username || 'Admin'}</span>
            <span className="user-role">
              {user?.role === 'admin' || user?.role === 'superadmin' ? txt.admin : txt.teacher}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <Icons.Logout />
          {!collapsed && <span className="nav-label">{txt.logout}</span>}
        </button>
      </div>
    </aside>
  )
}

export default ProSidebar
