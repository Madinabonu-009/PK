import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Loading } from '../../components/common'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './GroupsPage.css'

// SVG Icons
const GroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const ChildIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
)

const TeacherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const SunIcon = () => <span style={{ fontSize: '2rem' }}>☀️</span>
const StarIcon = () => <span style={{ fontSize: '2rem' }}>⭐</span>
const MoonIcon = () => <span style={{ fontSize: '2rem' }}>🌙</span>
const BookIcon = () => <span style={{ fontSize: '2rem' }}>📚</span>
const FlowerIcon = () => <span style={{ fontSize: '2rem' }}>🌸</span>
const RainbowIcon = () => <span style={{ fontSize: '2rem' }}>🌈</span>

const GROUP_ICONS = [SunIcon, StarIcon, MoonIcon, BookIcon, FlowerIcon, RainbowIcon]

// Texts
const TEXTS = {
  uz: {
    pageTitle: 'Guruhlar',
    totalGroups: 'Jami guruhlar',
    totalChildren: 'Jami bolalar',
    totalCapacity: 'Umumiy sig\'im',
    occupied: 'Band',
    addNew: 'Yangi guruh',
    emptyList: 'Guruhlar mavjud emas',
    addFirst: 'Birinchi guruhni qo\'shing',
    teacher: 'Tarbiyachi',
    notAssigned: 'Tayinlanmagan',
    childrenCount: 'Bolalar',
    capacityLabel: 'Sig\'im',
    occupiedLabel: 'Band',
    view: 'Ko\'rish',
    edit: 'Tahrirlash',
    // Modal
    addGroup: 'Yangi guruh qo\'shish',
    editGroup: 'Guruhni tahrirlash',
    groupName: 'Guruh nomi',
    groupNamePlaceholder: 'masalan: Kichkintoylar',
    ageRange: 'Yosh oralig\'i',
    ageRangePlaceholder: 'masalan: 2-3 yosh',
    capacity: 'Sig\'im (bolalar soni)',
    capacityPlaceholder: 'masalan: 15',
    selectTeacher: 'Tarbiyachi tanlang',
    noTeacher: 'Tarbiyachisiz',
    description: 'Tavsif (ixtiyoriy)',
    descriptionPlaceholder: 'Guruh haqida qisqacha ma\'lumot...',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    add: 'Qo\'shish',
    adding: 'Qo\'shilmoqda...',
    // Validation
    nameRequired: 'Guruh nomi kiritilishi shart',
    ageRequired: 'Yosh oralig\'i kiritilishi shart',
    capacityRequired: 'Sig\'im kiritilishi shart',
    capacityInvalid: 'Sig\'im musbat son bo\'lishi kerak',
    // Messages
    addSuccess: 'Guruh muvaffaqiyatli qo\'shildi!',
    editSuccess: 'Guruh muvaffaqiyatli yangilandi!',
    error: 'Xatolik yuz berdi'
  },
  ru: {
    pageTitle: 'Группы',
    totalGroups: 'Всего групп',
    totalChildren: 'Всего детей',
    totalCapacity: 'Общая вместимость',
    occupied: 'Занято',
    addNew: 'Новая группа',
    emptyList: 'Группы отсутствуют',
    addFirst: 'Добавьте первую группу',
    teacher: 'Воспитатель',
    notAssigned: 'Не назначен',
    childrenCount: 'Дети',
    capacityLabel: 'Вместимость',
    occupiedLabel: 'Занято',
    view: 'Просмотр',
    edit: 'Редактировать',
    addGroup: 'Добавить группу',
    editGroup: 'Редактировать группу',
    groupName: 'Название группы',
    groupNamePlaceholder: 'например: Малыши',
    ageRange: 'Возрастной диапазон',
    ageRangePlaceholder: 'например: 2-3 года',
    capacity: 'Вместимость (кол-во детей)',
    capacityPlaceholder: 'например: 15',
    selectTeacher: 'Выберите воспитателя',
    noTeacher: 'Без воспитателя',
    description: 'Описание (необязательно)',
    descriptionPlaceholder: 'Краткая информация о группе...',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    add: 'Добавить',
    adding: 'Добавление...',
    nameRequired: 'Название группы обязательно',
    ageRequired: 'Возрастной диапазон обязателен',
    capacityRequired: 'Вместимость обязательна',
    capacityInvalid: 'Вместимость должна быть положительным числом',
    addSuccess: 'Группа успешно добавлена!',
    editSuccess: 'Группа успешно обновлена!',
    error: 'Произошла ошибка'
  },
  en: {
    pageTitle: 'Groups',
    totalGroups: 'Total Groups',
    totalChildren: 'Total Children',
    totalCapacity: 'Total Capacity',
    occupied: 'Occupied',
    addNew: 'New Group',
    emptyList: 'No groups available',
    addFirst: 'Add your first group',
    teacher: 'Teacher',
    notAssigned: 'Not assigned',
    childrenCount: 'Children',
    capacityLabel: 'Capacity',
    occupiedLabel: 'Occupied',
    view: 'View',
    edit: 'Edit',
    addGroup: 'Add New Group',
    editGroup: 'Edit Group',
    groupName: 'Group Name',
    groupNamePlaceholder: 'e.g.: Toddlers',
    ageRange: 'Age Range',
    ageRangePlaceholder: 'e.g.: 2-3 years',
    capacity: 'Capacity (number of children)',
    capacityPlaceholder: 'e.g.: 15',
    selectTeacher: 'Select Teacher',
    noTeacher: 'No Teacher',
    description: 'Description (optional)',
    descriptionPlaceholder: 'Brief info about the group...',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    add: 'Add',
    adding: 'Adding...',
    nameRequired: 'Group name is required',
    ageRequired: 'Age range is required',
    capacityRequired: 'Capacity is required',
    capacityInvalid: 'Capacity must be a positive number',
    addSuccess: 'Group added successfully!',
    editSuccess: 'Group updated successfully!',
    error: 'An error occurred'
  }
}

// Group Form Modal Component
function GroupFormModal({ isOpen, onClose, mode, group, teachers, onSuccess, language }) {
  const txt = TEXTS[language]
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    ageRange: '',
    capacity: '',
    teacherId: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Form ma'lumotlarini to'ldirish
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && group) {
        setFormData({
          name: group.name || '',
          ageRange: group.ageRange || '',
          capacity: group.capacity?.toString() || '',
          teacherId: group.teacherId || '',
          description: group.description || ''
        })
      } else {
        setFormData({
          name: '',
          ageRange: '',
          capacity: '',
          teacherId: '',
          description: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, group])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Xatoni tozalash
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = txt.nameRequired
    }
    if (!formData.ageRange.trim()) {
      newErrors.ageRange = txt.ageRequired
    }
    if (!formData.capacity) {
      newErrors.capacity = txt.capacityRequired
    } else if (isNaN(parseInt(formData.capacity)) || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = txt.capacityInvalid
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setSubmitting(true)
    
    try {
      const payload = {
        name: formData.name.trim(),
        ageRange: formData.ageRange.trim(),
        capacity: parseInt(formData.capacity),
        teacherId: formData.teacherId || null,
        description: formData.description.trim() || null
      }

      if (mode === 'add') {
        await api.post('/groups', payload)
        toast.success(txt.addSuccess)
      } else {
        const groupId = group.id || group._id
        await api.put(`/groups/${groupId}`, payload)
        toast.success(txt.editSuccess)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || txt.error
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="group-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="group-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="group-modal-header">
            <div className="modal-header-content">
              <div className="modal-icon">
                <GroupIcon />
              </div>
              <div>
                <h2>{mode === 'add' ? txt.addGroup : txt.editGroup}</h2>
                <p>{mode === 'add' ? 'Yangi guruh ma\'lumotlarini kiriting' : 'Guruh ma\'lumotlarini tahrirlang'}</p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} type="button">
              <CloseIcon />
            </button>
          </div>

          {/* Modal Body - Form */}
          <form onSubmit={handleSubmit} className="group-modal-form">
            <div className="form-body">
              {/* Guruh nomi */}
              <div className="form-field">
                <label htmlFor="name">
                  <span className="field-icon">📝</span>
                  {txt.groupName}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={txt.groupNamePlaceholder}
                  className={errors.name ? 'error' : ''}
                  autoFocus
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Yosh oralig'i */}
              <div className="form-field">
                <label htmlFor="ageRange">
                  <span className="field-icon">👶</span>
                  {txt.ageRange}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="ageRange"
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleChange}
                  placeholder={txt.ageRangePlaceholder}
                  className={errors.ageRange ? 'error' : ''}
                />
                {errors.ageRange && <span className="field-error">{errors.ageRange}</span>}
              </div>

              {/* Sig'im */}
              <div className="form-field">
                <label htmlFor="capacity">
                  <span className="field-icon">👥</span>
                  {txt.capacity}
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder={txt.capacityPlaceholder}
                  className={errors.capacity ? 'error' : ''}
                />
                {errors.capacity && <span className="field-error">{errors.capacity}</span>}
              </div>

              {/* Tarbiyachi */}
              <div className="form-field">
                <label htmlFor="teacherId">
                  <span className="field-icon">👩‍🏫</span>
                  {txt.teacher}
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                >
                  <option value="">{txt.noTeacher}</option>
                  {teachers.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tavsif */}
              <div className="form-field full-width">
                <label htmlFor="description">
                  <span className="field-icon">📋</span>
                  {txt.description}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={txt.descriptionPlaceholder}
                  rows="3"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="group-modal-footer">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={submitting}
              >
                {txt.cancel}
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    {mode === 'add' ? txt.adding : txt.saving}
                  </>
                ) : (
                  <>
                    {mode === 'add' ? <PlusIcon /> : <EditIcon />}
                    {mode === 'add' ? txt.add : txt.save}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Component
function GroupsPage() {
  const { user, logout } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedGroup, setSelectedGroup] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [groupsRes, teachersRes] = await Promise.all([
        api.get('/groups'),
        api.get('/teachers')
      ])
      
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      const teachersData = teachersRes.data?.data || (Array.isArray(teachersRes.data) ? teachersRes.data : [])
      
      setGroups(groupsData)
      setTeachers(teachersData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => (t.id || t._id) === teacherId)
    return teacher ? teacher.name : txt.notAssigned
  }

  const getTotalChildren = () => groups.reduce((sum, g) => sum + (g.childCount || 0), 0)
  const getTotalCapacity = () => groups.reduce((sum, g) => sum + (g.capacity || 0), 0)
  const getOccupancyRate = () => {
    const total = getTotalCapacity()
    return total > 0 ? Math.round((getTotalChildren() / total) * 100) : 0
  }

  const openAddModal = () => {
    setModalMode('add')
    setSelectedGroup(null)
    setModalOpen(true)
  }

  const openEditModal = (group) => {
    setModalMode('edit')
    setSelectedGroup(group)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedGroup(null)
  }

  if (loading && groups.length === 0) {
    return (
      <div className="groups-page">
        <Loading />
      </div>
    )
  }

  return (
    <div className="groups-page">
      {/* Header */}
      <div className="groups-header">
        <div className="header-left">
          <div className="page-icon"><GroupIcon /></div>
          <h1>{txt.pageTitle}</h1>
        </div>
        <div className="header-right">
          <button className="add-btn" onClick={openAddModal}>
            <PlusIcon /> {txt.addNew}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="groups-stats">
        <div className="stat-card stat-groups">
          <div className="stat-icon"><GroupIcon /></div>
          <div className="stat-info">
            <h3>{groups.length}</h3>
            <p>{txt.totalGroups}</p>
          </div>
        </div>
        <div className="stat-card stat-children">
          <div className="stat-icon"><ChildIcon /></div>
          <div className="stat-info">
            <h3>{getTotalChildren()}</h3>
            <p>{txt.totalChildren}</p>
          </div>
        </div>
        <div className="stat-card stat-teachers">
          <div className="stat-icon"><TeacherIcon /></div>
          <div className="stat-info">
            <h3>{getTotalCapacity()}</h3>
            <p>{txt.totalCapacity}</p>
          </div>
        </div>
        <div className="stat-card stat-occupied">
          <div className="stat-icon"><ChartIcon /></div>
          <div className="stat-info">
            <h3>{getOccupancyRate()}%</h3>
            <p>{txt.occupied}</p>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><GroupIcon /></div>
          <h3>{txt.emptyList}</h3>
          <p>{txt.addFirst}</p>
          <button className="add-btn" onClick={openAddModal}>
            <PlusIcon /> {txt.addNew}
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group, idx) => {
            const IconComponent = GROUP_ICONS[idx % GROUP_ICONS.length]
            const occupancy = group.capacity > 0 
              ? Math.round(((group.childCount || 0) / group.capacity) * 100) 
              : 0
            
            return (
              <motion.div 
                key={group.id || group._id} 
                className="group-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="group-card-header">
                  <div className="group-header-content">
                    <div className="group-icon">
                      <IconComponent />
                    </div>
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <span className="group-age">{group.ageRange}</span>
                    </div>
                  </div>
                </div>
                
                <div className="group-card-body">
                  <div className="group-stats-row">
                    <div className="group-stat">
                      <span className="group-stat-value">{group.childCount || 0}</span>
                      <span className="group-stat-label">{txt.childrenCount}</span>
                    </div>
                    <div className="group-stat">
                      <span className="group-stat-value">{group.capacity}</span>
                      <span className="group-stat-label">{txt.capacityLabel}</span>
                    </div>
                    <div className="group-stat">
                      <span className="group-stat-value">{occupancy}%</span>
                      <span className="group-stat-label">{txt.occupiedLabel}</span>
                    </div>
                  </div>

                  <div className="group-teacher">
                    <div className="teacher-avatar"><TeacherIcon /></div>
                    <div className="teacher-info">
                      <span className="teacher-name">{getTeacherName(group.teacherId)}</span>
                      <span className="teacher-role">{txt.teacher}</span>
                    </div>
                  </div>
                </div>

                <div className="group-card-footer">
                  <button 
                    className="btn-view" 
                    onClick={() => navigate(`/admin/groups/${group.id || group._id}`)}
                  >
                    <EyeIcon /> {txt.view}
                  </button>
                  <button 
                    className="btn-edit" 
                    onClick={() => openEditModal(group)}
                  >
                    <EditIcon /> {txt.edit}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Group Form Modal */}
      <GroupFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        group={selectedGroup}
        teachers={teachers}
        onSuccess={fetchData}
        language={language}
      />
    </div>
  )
}

export default GroupsPage
