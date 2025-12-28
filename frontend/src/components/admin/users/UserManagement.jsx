import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './UserManagement.css'

// Predefined Roles
const PREDEFINED_ROLES = [
  { id: 'super_admin', name: 'Super Admin', color: '#ef4444', permissions: ['*'] },
  { id: 'admin', name: 'Admin', color: '#f59e0b', permissions: ['children.*', 'attendance.*', 'finance.*', 'groups.*', 'reports.view'] },
  { id: 'teacher', name: "O'qituvchi", color: '#10b981', permissions: ['children.view', 'attendance.*', 'groups.view'] },
  { id: 'accountant', name: 'Buxgalter', color: '#3b82f6', permissions: ['finance.*', 'reports.*'] },
  { id: 'viewer', name: "Ko'ruvchi", color: '#6b7280', permissions: ['*.view'] }
]

// Permission Categories
const PERMISSION_CATEGORIES = [
  { 
    id: 'children', 
    name: 'Bolalar', 
    permissions: [
      { id: 'children.view', name: "Ko'rish" },
      { id: 'children.create', name: "Qo'shish" },
      { id: 'children.edit', name: 'Tahrirlash' },
      { id: 'children.delete', name: "O'chirish" }
    ]
  },
  { 
    id: 'attendance', 
    name: 'Davomat', 
    permissions: [
      { id: 'attendance.view', name: "Ko'rish" },
      { id: 'attendance.mark', name: 'Belgilash' },
      { id: 'attendance.edit', name: 'Tahrirlash' }
    ]
  },
  { 
    id: 'finance', 
    name: 'Moliya', 
    permissions: [
      { id: 'finance.view', name: "Ko'rish" },
      { id: 'finance.create', name: "To'lov qilish" },
      { id: 'finance.edit', name: 'Tahrirlash' },
      { id: 'finance.delete', name: "O'chirish" }
    ]
  },
  { 
    id: 'groups', 
    name: 'Guruhlar', 
    permissions: [
      { id: 'groups.view', name: "Ko'rish" },
      { id: 'groups.create', name: "Qo'shish" },
      { id: 'groups.edit', name: 'Tahrirlash' },
      { id: 'groups.delete', name: "O'chirish" }
    ]
  },
  { 
    id: 'reports', 
    name: 'Hisobotlar', 
    permissions: [
      { id: 'reports.view', name: "Ko'rish" },
      { id: 'reports.export', name: 'Eksport' }
    ]
  },
  { 
    id: 'settings', 
    name: 'Sozlamalar', 
    permissions: [
      { id: 'settings.view', name: "Ko'rish" },
      { id: 'settings.edit', name: 'Tahrirlash' }
    ]
  },
  { 
    id: 'users', 
    name: 'Foydalanuvchilar', 
    permissions: [
      { id: 'users.view', name: "Ko'rish" },
      { id: 'users.create', name: "Qo'shish" },
      { id: 'users.edit', name: 'Tahrirlash' },
      { id: 'users.delete', name: "O'chirish" }
    ]
  }
]

// User Card
function UserCard({ user, onEdit, onDelete, onToggleStatus }) {
  const role = PREDEFINED_ROLES.find(r => r.id === user.role) || { name: user.role, color: '#6b7280' }

  return (
    <motion.div
      className={`user-card ${user.status === 'inactive' ? 'inactive' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="user-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} />
        ) : (
          <span>{user.name?.charAt(0)}</span>
        )}
        <span className={`user-status-dot ${user.status}`} />
      </div>

      <div className="user-info">
        <h4 className="user-name">{user.name}</h4>
        <p className="user-email">{user.email}</p>
        <span className="user-role" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
          {role.name}
        </span>
      </div>

      <div className="user-meta">
        <div className="meta-item">
          <span className="meta-label">Oxirgi kirish</span>
          <span className="meta-value">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('uz-UZ') : 'Hech qachon'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Yaratilgan</span>
          <span className="meta-value">{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span>
        </div>
      </div>

      <div className="user-actions">
        <button className="user-action-btn edit" onClick={() => onEdit?.(user)} title="Tahrirlash">
          ✏️
        </button>
        <button 
          className="user-action-btn toggle" 
          onClick={() => onToggleStatus?.(user)}
          title={user.status === 'active' ? "O'chirish" : 'Faollashtirish'}
        >
          {user.status === 'active' ? '🔒' : '🔓'}
        </button>
        <button className="user-action-btn delete" onClick={() => onDelete?.(user)} title="O'chirish">
          🗑️
        </button>
      </div>
    </motion.div>
  )
}

// User Form Modal
function UserFormModal({ user, onSave, onClose, loading }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'viewer',
    password: '',
    confirmPassword: '',
    customPermissions: user?.customPermissions || []
  })
  const [showCustomPermissions, setShowCustomPermissions] = useState(false)
  const [errors, setErrors] = useState({})

  const isEditing = !!user?.id

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Ism kiritilishi shart'
    if (!formData.email.trim()) newErrors.email = 'Email kiritilishi shart'
    if (!isEditing && !formData.password) newErrors.password = 'Parol kiritilishi shart'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Parollar mos kelmaydi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const { confirmPassword, ...data } = formData
      if (!data.password) delete data.password
      onSave?.({ ...user, ...data })
    }
  }

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permId)
        ? prev.customPermissions.filter(p => p !== permId)
        : [...prev.customPermissions, permId]
    }))
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="user-form-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Ism *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Rol *</label>
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                {PREDEFINED_ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{isEditing ? 'Yangi parol' : 'Parol *'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? 'error' : ''}
                placeholder={isEditing ? "O'zgartirmaslik uchun bo'sh qoldiring" : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Parolni tasdiqlash</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="custom-permissions-section">
            <button
              type="button"
              className="toggle-permissions-btn"
              onClick={() => setShowCustomPermissions(!showCustomPermissions)}
            >
              {showCustomPermissions ? '▼' : '▶'} Maxsus ruxsatlar
            </button>

            <AnimatePresence>
              {showCustomPermissions && (
                <motion.div
                  className="permissions-grid"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {PERMISSION_CATEGORIES.map(category => (
                    <div key={category.id} className="permission-category">
                      <h4>{category.name}</h4>
                      <div className="permission-list">
                        {category.permissions.map(perm => (
                          <label key={perm.id} className="permission-item">
                            <input
                              type="checkbox"
                              checked={formData.customPermissions.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <span>{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : isEditing ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Activity Log Item
function ActivityLogItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔑'
      case 'logout': return '🚪'
      case 'create': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      case 'view': return '👁️'
      default: return '📝'
    }
  }

  return (
    <div className="activity-log-item">
      <span className="activity-icon">{getActivityIcon(activity.type)}</span>
      <div className="activity-content">
        <p className="activity-message">{activity.message}</p>
        <div className="activity-meta">
          <span className="activity-user">{activity.userName}</span>
          <span className="activity-time">
            {new Date(activity.timestamp).toLocaleString('uz-UZ')}
          </span>
          {activity.ip && <span className="activity-ip">{activity.ip}</span>}
        </div>
      </div>
    </div>
  )
}

// Main User Management Component
function UserManagement({
  users = [],
  activities = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onToggleUserStatus,
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = !roleFilter || user.role === roleFilter
      const matchesStatus = !statusFilter || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleSave = async (userData) => {
    if (userData.id) {
      await onUpdateUser?.(userData)
    } else {
      await onCreateUser?.(userData)
    }
    setShowModal(false)
    setEditingUser(null)
  }

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  }), [users])

  return (
    <div className="user-management">
      {/* Stats */}
      <div className="user-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Jami</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Faol</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏸️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.inactive}</span>
            <span className="stat-label">Nofaol</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👑</span>
          <div className="stat-info">
            <span className="stat-value">{stats.admins}</span>
            <span className="stat-label">Adminlar</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Foydalanuvchilar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📋 Faoliyat jurnali
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Toolbar */}
          <div className="user-toolbar">
            <div className="toolbar-left">
              <input
                type="text"
                className="search-input"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="filter-select"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">Barcha rollar</option>
                {PREDEFINED_ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Barcha holatlar</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
            </div>
            <button className="add-user-btn" onClick={handleCreate}>
              ➕ Yangi foydalanuvchi
            </button>
          </div>

          {/* Users Grid */}
          <div className="users-grid">
            <AnimatePresence>
              {filteredUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={onDeleteUser}
                  onToggleStatus={onToggleUserStatus}
                />
              ))}
            </AnimatePresence>

            {filteredUsers.length === 0 && (
              <div className="no-users">
                <span className="no-users-icon">👤</span>
                <p>Foydalanuvchilar topilmadi</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'activity' && (
        <div className="activity-log">
          {activities.length > 0 ? (
            activities.map((activity, idx) => (
              <ActivityLogItem key={idx} activity={activity} />
            ))
          ) : (
            <div className="no-activity">
              <span className="no-activity-icon">📋</span>
              <p>Faoliyat jurnali bo'sh</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <UserFormModal
            user={editingUser}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingUser(null) }}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserManagement
export { UserCard, UserFormModal, ActivityLogItem, PREDEFINED_ROLES, PERMISSION_CATEGORIES }
