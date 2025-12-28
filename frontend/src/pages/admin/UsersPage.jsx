import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api, { clearCache } from '../../services/api'
import './UsersPage.css'

// Translations
const texts = {
  uz: {
    title: 'Foydalanuvchilar',
    subtitle: 'Tizim foydalanuvchilari',
    newUser: 'Yangi foydalanuvchi',
    all: 'Barchasi',
    admins: 'Adminlar',
    teachers: 'O\'qituvchilar',
    parents: 'Ota-onalar',
    search: 'Qidirish...',
    name: 'Ism',
    email: 'Email',
    phone: 'Telefon',
    role: 'Rol',
    status: 'Holat',
    actions: 'Amallar',
    active: 'Faol',
    inactive: 'Nofaol',
    edit: 'Tahrirlash',
    delete: "O'chirish",
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    password: 'Parol',
    confirmDelete: "O'chirishni tasdiqlaysizmi?",
    noUsers: 'Foydalanuvchilar topilmadi',
    userSaved: 'Saqlandi!',
    userDeleted: "O'chirildi!"
  },
  ru: {
    title: 'Пользователи',
    subtitle: 'Пользователи системы',
    newUser: 'Новый пользователь',
    all: 'Все',
    admins: 'Админы',
    teachers: 'Учителя',
    parents: 'Родители',
    search: 'Поиск...',
    name: 'Имя',
    email: 'Email',
    phone: 'Телефон',
    role: 'Роль',
    status: 'Статус',
    actions: 'Действия',
    active: 'Активен',
    inactive: 'Неактивен',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    password: 'Пароль',
    confirmDelete: 'Подтвердите удаление',
    noUsers: 'Пользователи не найдены',
    userSaved: 'Сохранено!',
    userDeleted: 'Удалено!'
  },
  en: {
    title: 'Users',
    subtitle: 'System users',
    newUser: 'New User',
    all: 'All',
    admins: 'Admins',
    teachers: 'Teachers',
    parents: 'Parents',
    search: 'Search...',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    password: 'Password',
    confirmDelete: 'Confirm delete?',
    noUsers: 'No users found',
    userSaved: 'Saved!',
    userDeleted: 'Deleted!'
  }
}

// Stats Card
function StatsCard({ icon, label, value, color }) {
  return (
    <div className="us-stat-card" style={{ '--accent': color }}>
      <div className="us-stat-icon">{icon}</div>
      <div className="us-stat-info">
        <span className="us-stat-value">{value}</span>
        <span className="us-stat-label">{label}</span>
      </div>
    </div>
  )
}

// User Card
function UserCard({ user, txt, onEdit, onDelete }) {
  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      teacher: '#3b82f6',
      parent: '#10b981'
    }
    return colors[role] || '#6b7280'
  }

  const getRoleLabel = (role) => {
    const labels = { admin: 'Admin', teacher: "O'qituvchi", parent: 'Ota-ona' }
    return labels[role] || role
  }

  return (
    <div className="us-user-card">
      <div className="us-user-avatar">
        {user.photo ? (
          <img src={user.photo} alt={user.name} />
        ) : (
          <span>{user.name?.[0] || user.email?.[0] || '?'}</span>
        )}
      </div>
      <div className="us-user-info">
        <h3>{user.name || user.email}</h3>
        <p className="us-user-email">{user.email}</p>
        {user.phone && <p className="us-user-phone">📞 {user.phone}</p>}
      </div>
      <div className="us-user-meta">
        <span className="us-role-badge" style={{ background: getRoleColor(user.role) }}>
          {getRoleLabel(user.role)}
        </span>
        <span className={`us-status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
          {user.isActive !== false ? txt.active : txt.inactive}
        </span>
      </div>
      <div className="us-user-actions">
        <button className="us-btn us-btn-edit" onClick={onEdit}>✏️</button>
        <button className="us-btn us-btn-delete" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  )
}

// User Form Modal
function UserFormModal({ show, onClose, user, txt, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'parent',
    password: '',
    isActive: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'parent',
        password: '',
        isActive: user.isActive !== false
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'parent',
        password: '',
        isActive: true
      })
    }
  }, [user, show])

  const handleSubmit = async () => {
    if (!formData.email) return
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  return (
    <div className="us-modal-overlay" onClick={onClose}>
      <div className="us-modal" onClick={e => e.stopPropagation()}>
        <div className="us-modal-header">
          <h2>{user ? txt.edit : txt.newUser}</h2>
          <button className="us-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="us-modal-body">
          <div className="us-form-row">
            <label>{txt.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ism familiya"
            />
          </div>

          <div className="us-form-row">
            <label>{txt.email} *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="us-form-row">
            <label>{txt.phone}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div className="us-form-row">
            <label>{txt.role}</label>
            <select
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="teacher">O'qituvchi</option>
              <option value="parent">Ota-ona</option>
            </select>
          </div>

          {!user && (
            <div className="us-form-row">
              <label>{txt.password}</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="us-form-row">
            <label>{txt.status}</label>
            <div className="us-toggle-btns">
              <button
                className={`us-toggle-btn ${formData.isActive ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
              >
                {txt.active}
              </button>
              <button
                className={`us-toggle-btn ${!formData.isActive ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
              >
                {txt.inactive}
              </button>
            </div>
          </div>
        </div>

        <div className="us-modal-footer">
          <button className="us-btn us-btn-cancel" onClick={onClose}>{txt.cancel}</button>
          <button className="us-btn us-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? '...' : txt.save}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function UsersPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const toast = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const txt = texts[language] || texts.uz

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users', { skipCache: true })
      setUsers(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Foydalanuvchilarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      clearCache('users')
      fetchUsers()
      toast.success(txt.userSaved)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik')
      throw error
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm(txt.confirmDelete)) return
    try {
      await api.delete(`/users/${userId}`)
      clearCache('users')
      fetchUsers()
      toast.success(txt.userDeleted)
    } catch (error) {
      toast.error(error.response?.data?.error || 'O\'chirishda xatolik')
    }
  }

  const filteredUsers = useMemo(() => {
    let result = users

    if (activeTab !== 'all') {
      result = result.filter(u => u.role === activeTab)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.includes(query)
      )
    }

    return result
  }, [users, activeTab, searchQuery])

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length
  }), [users])

  const tabs = [
    { id: 'all', label: txt.all, count: stats.total },
    { id: 'admin', label: txt.admins, count: stats.admins },
    { id: 'teacher', label: txt.teachers, count: stats.teachers },
    { id: 'parent', label: txt.parents, count: stats.parents }
  ]

  if (loading) {
    return (
      <div className="us-page">
        <div className="us-loading">
          <div className="us-spinner"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="us-page">
      {/* Header */}
      <div className="us-header">
        <div className="us-header-content">
          <button className="us-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Orqaga
          </button>
          <div className="us-header-title">
            <h1>{txt.title}</h1>
            <p>{txt.subtitle}</p>
          </div>
        </div>
        <button className="us-new-btn" onClick={() => { setEditingUser(null); setShowModal(true); }}>
          <span>+</span> {txt.newUser}
        </button>
      </div>

      {/* Stats */}
      <div className="us-stats">
        <StatsCard icon="👥" label={txt.all} value={stats.total} color="#3b82f6" />
        <StatsCard icon="👑" label={txt.admins} value={stats.admins} color="#ef4444" />
        <StatsCard icon="👨‍🏫" label={txt.teachers} value={stats.teachers} color="#8b5cf6" />
        <StatsCard icon="👨‍👩‍👧" label={txt.parents} value={stats.parents} color="#10b981" />
      </div>

      {/* Filter */}
      <div className="us-filter-section">
        <div className="us-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`us-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="us-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          className="us-search"
          placeholder={txt.search}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="us-users-list">
        {filteredUsers.length === 0 ? (
          <div className="us-empty">
            <span className="us-empty-icon">👥</span>
            <p>{txt.noUsers}</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              txt={txt}
              onEdit={() => { setEditingUser(user); setShowModal(true); }}
              onDelete={() => handleDelete(user.id)}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <UserFormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        user={editingUser}
        txt={txt}
        onSave={handleSave}
      />
    </div>
  )
}
