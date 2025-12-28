import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import { Loading } from '../../components/common'
import api, { clearCache } from '../../services/api'
import './ChildrenPage.css'

// Icons
const ChildIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const GroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

// Texts
const TEXTS = {
  uz: {
    pageTitle: 'Bolalar',
    totalChildren: 'Jami bolalar',
    totalGroups: 'Guruhlar',
    avgAge: 'O\'rtacha yosh',
    withAllergies: 'Allergiyali',
    search: 'Qidirish...',
    allGroups: 'Barcha guruhlar',
    addChild: 'Bola qo\'shish',
    editChild: 'Bolani tahrirlash',
    emptyList: 'Bolalar ro\'yxati bo\'sh',
    emptyDesc: 'Birinchi bolani qo\'shing',
    // Card
    years: 'yosh',
    group: 'Guruh',
    parent: 'Ota-ona',
    phone: 'Telefon',
    birthDate: 'Tug\'ilgan sana',
    allergies: 'Allergiyalar',
    notes: 'Izohlar',
    noAllergy: 'Yo\'q',
    noNotes: 'Izoh yo\'q',
    view: 'Ko\'rish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    // Form
    firstName: 'Ism',
    firstNamePlaceholder: 'Bolaning ismi',
    lastName: 'Familiya',
    lastNamePlaceholder: 'Bolaning familiyasi',
    selectGroup: 'Guruhni tanlang',
    parentName: 'Ota-ona ismi',
    parentNamePlaceholder: 'To\'liq ism',
    parentPhone: 'Telefon raqam',
    parentPhonePlaceholder: '+998901234567',
    allergiesPlaceholder: 'masalan: sut, tuxum',
    notesPlaceholder: 'Qo\'shimcha ma\'lumotlar...',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    add: 'Qo\'shish',
    adding: 'Qo\'shilmoqda...',
    // Validation
    firstNameRequired: 'Ism kiritilishi shart',
    lastNameRequired: 'Familiya kiritilishi shart',
    birthDateRequired: 'Tug\'ilgan sana kiritilishi shart',
    groupRequired: 'Guruh tanlanishi shart',
    parentNameRequired: 'Ota-ona ismi kiritilishi shart',
    phoneRequired: 'Telefon raqam kiritilishi shart',
    phoneInvalid: 'Telefon raqam noto\'g\'ri',
    // Messages
    addSuccess: 'Bola muvaffaqiyatli qo\'shildi!',
    editSuccess: 'Ma\'lumotlar yangilandi!',
    deleteSuccess: 'Bola o\'chirildi!',
    deleteConfirm: 'Rostdan ham o\'chirmoqchimisiz?',
    error: 'Xatolik yuz berdi'
  },
  ru: {
    pageTitle: 'Дети',
    totalChildren: 'Всего детей',
    totalGroups: 'Группы',
    avgAge: 'Средний возраст',
    withAllergies: 'С аллергией',
    search: 'Поиск...',
    allGroups: 'Все группы',
    addChild: 'Добавить ребенка',
    editChild: 'Редактировать',
    emptyList: 'Список детей пуст',
    emptyDesc: 'Добавьте первого ребенка',
    years: 'лет',
    group: 'Группа',
    parent: 'Родитель',
    phone: 'Телефон',
    birthDate: 'Дата рождения',
    allergies: 'Аллергии',
    notes: 'Заметки',
    noAllergy: 'Нет',
    noNotes: 'Нет заметок',
    view: 'Просмотр',
    edit: 'Редактировать',
    delete: 'Удалить',
    firstName: 'Имя',
    firstNamePlaceholder: 'Имя ребенка',
    lastName: 'Фамилия',
    lastNamePlaceholder: 'Фамилия ребенка',
    selectGroup: 'Выберите группу',
    parentName: 'Имя родителя',
    parentNamePlaceholder: 'Полное имя',
    parentPhone: 'Телефон',
    parentPhonePlaceholder: '+998901234567',
    allergiesPlaceholder: 'например: молоко, яйца',
    notesPlaceholder: 'Дополнительная информация...',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    add: 'Добавить',
    adding: 'Добавление...',
    firstNameRequired: 'Имя обязательно',
    lastNameRequired: 'Фамилия обязательна',
    birthDateRequired: 'Дата рождения обязательна',
    groupRequired: 'Группа обязательна',
    parentNameRequired: 'Имя родителя обязательно',
    phoneRequired: 'Телефон обязателен',
    phoneInvalid: 'Неверный формат телефона',
    addSuccess: 'Ребенок успешно добавлен!',
    editSuccess: 'Данные обновлены!',
    deleteSuccess: 'Ребенок удален!',
    deleteConfirm: 'Вы уверены, что хотите удалить?',
    error: 'Произошла ошибка'
  },
  en: {
    pageTitle: 'Children',
    totalChildren: 'Total Children',
    totalGroups: 'Groups',
    avgAge: 'Average Age',
    withAllergies: 'With Allergies',
    search: 'Search...',
    allGroups: 'All Groups',
    addChild: 'Add Child',
    editChild: 'Edit Child',
    emptyList: 'No children yet',
    emptyDesc: 'Add your first child',
    years: 'years',
    group: 'Group',
    parent: 'Parent',
    phone: 'Phone',
    birthDate: 'Birth Date',
    allergies: 'Allergies',
    notes: 'Notes',
    noAllergy: 'None',
    noNotes: 'No notes',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    firstName: 'First Name',
    firstNamePlaceholder: 'Child\'s first name',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Child\'s last name',
    selectGroup: 'Select group',
    parentName: 'Parent Name',
    parentNamePlaceholder: 'Full name',
    parentPhone: 'Phone Number',
    parentPhonePlaceholder: '+998901234567',
    allergiesPlaceholder: 'e.g.: milk, eggs',
    notesPlaceholder: 'Additional information...',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    add: 'Add',
    adding: 'Adding...',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    birthDateRequired: 'Birth date is required',
    groupRequired: 'Group is required',
    parentNameRequired: 'Parent name is required',
    phoneRequired: 'Phone is required',
    phoneInvalid: 'Invalid phone format',
    addSuccess: 'Child added successfully!',
    editSuccess: 'Data updated successfully!',
    deleteSuccess: 'Child deleted!',
    deleteConfirm: 'Are you sure you want to delete?',
    error: 'An error occurred'
  }
}

// Avatar colors
const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

// Child Form Modal Component
function ChildFormModal({ isOpen, onClose, mode, child, groups, onSuccess, language }) {
  const txt = TEXTS[language]
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    groupId: '',
    parentName: '',
    parentPhone: '',
    allergies: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && child) {
        setFormData({
          firstName: child.firstName || '',
          lastName: child.lastName || '',
          birthDate: child.birthDate?.split('T')[0] || '',
          groupId: child.groupId || '',
          parentName: child.parentName || '',
          parentPhone: child.parentPhone || '',
          allergies: Array.isArray(child.allergies) ? child.allergies.join(', ') : '',
          notes: child.notes || ''
        })
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          birthDate: '',
          groupId: '',
          parentName: '',
          parentPhone: '',
          allergies: '',
          notes: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, child])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = txt.firstNameRequired
    if (!formData.lastName.trim()) newErrors.lastName = txt.lastNameRequired
    if (!formData.birthDate) newErrors.birthDate = txt.birthDateRequired
    if (!formData.groupId) newErrors.groupId = txt.groupRequired
    if (!formData.parentName.trim()) newErrors.parentName = txt.parentNameRequired
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = txt.phoneRequired
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.parentPhone.replace(/\s/g, ''))) {
      newErrors.parentPhone = txt.phoneInvalid
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        birthDate: formData.birthDate,
        groupId: formData.groupId,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        notes: formData.notes.trim() || null
      }

      if (mode === 'add') {
        await api.post('/children', payload)
        clearCache('children')
        toast.success(txt.addSuccess)
      } else {
        const childId = child.id || child._id
        await api.put(`/children/${childId}`, payload)
        clearCache('children')
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
        className="child-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="child-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="child-modal-header">
            <div className="modal-header-content">
              <div className="modal-icon"><ChildIcon /></div>
              <div>
                <h2>{mode === 'add' ? txt.addChild : txt.editChild}</h2>
                <p>{mode === 'add' ? 'Yangi bola ma\'lumotlarini kiriting' : 'Ma\'lumotlarni tahrirlang'}</p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} type="button">
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="child-modal-form">
            <div className="form-body">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">
                    <span className="field-icon">👤</span>
                    {txt.firstName}<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={txt.firstNamePlaceholder}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">
                    <span className="field-icon">👤</span>
                    {txt.lastName}<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={txt.lastNamePlaceholder}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="birthDate">
                    <span className="field-icon">📅</span>
                    {txt.birthDate}<span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={errors.birthDate ? 'error' : ''}
                  />
                  {errors.birthDate && <span className="field-error">{errors.birthDate}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="groupId">
                    <span className="field-icon">👥</span>
                    {txt.group}<span className="required">*</span>
                  </label>
                  <select
                    id="groupId"
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    className={errors.groupId ? 'error' : ''}
                  >
                    <option value="">{txt.selectGroup}</option>
                    {groups.map(g => (
                      <option key={g.id || g._id} value={g.id || g._id}>{g.name}</option>
                    ))}
                  </select>
                  {errors.groupId && <span className="field-error">{errors.groupId}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="parentName">
                    <span className="field-icon">👨‍👩‍👧</span>
                    {txt.parentName}<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder={txt.parentNamePlaceholder}
                    className={errors.parentName ? 'error' : ''}
                  />
                  {errors.parentName && <span className="field-error">{errors.parentName}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="parentPhone">
                    <span className="field-icon">📞</span>
                    {txt.parentPhone}<span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder={txt.parentPhonePlaceholder}
                    className={errors.parentPhone ? 'error' : ''}
                  />
                  {errors.parentPhone && <span className="field-error">{errors.parentPhone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="allergies">
                  <span className="field-icon">⚠️</span>
                  {txt.allergies}
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder={txt.allergiesPlaceholder}
                />
              </div>

              <div className="form-field">
                <label htmlFor="notes">
                  <span className="field-icon">📝</span>
                  {txt.notes}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={txt.notesPlaceholder}
                  rows="3"
                />
              </div>
            </div>

            <div className="child-modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                {txt.cancel}
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
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
function ChildrenPage() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [groups, setGroups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedChild, setSelectedChild] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [childrenRes, groupsRes] = await Promise.all([
        api.get('/children', { skipCache: true }),
        api.get('/groups', { skipCache: true })
      ])
      
      const childrenData = childrenRes.data?.data || (Array.isArray(childrenRes.data) ? childrenRes.data : [])
      const groupsData = groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : [])
      
      setChildren(childrenData)
      setGroups(groupsData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getGroupName = (groupId) => {
    const group = groups.find(g => (g.id || g._id) === groupId)
    return group ? group.name : '-'
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length]

  // Stats
  const totalChildren = children.length
  const uniqueGroups = [...new Set(children.map(c => c.groupId))].length
  const avgAge = children.length > 0 
    ? Math.round(children.reduce((sum, c) => sum + calculateAge(c.birthDate), 0) / children.length)
    : 0
  const withAllergies = children.filter(c => c.allergies && c.allergies.length > 0).length

  // Filter
  const filteredChildren = children.filter(child => {
    const matchesSearch = !searchQuery || 
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.parentName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !selectedGroup || child.groupId === selectedGroup
    return matchesSearch && matchesGroup
  })

  const openAddModal = () => {
    setModalMode('add')
    setSelectedChild(null)
    setModalOpen(true)
  }

  const openEditModal = (child) => {
    setModalMode('edit')
    setSelectedChild(child)
    setModalOpen(true)
  }

  const handleDelete = async (child) => {
    if (!window.confirm(txt.deleteConfirm)) return
    
    try {
      const childId = child.id || child._id
      await api.delete(`/children/${childId}`)
      clearCache('children')
      toast.success(txt.deleteSuccess)
      fetchData()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  if (loading && children.length === 0) {
    return (
      <div className="children-page">
        <Loading />
      </div>
    )
  }

  return (
    <div className="children-page">
      {/* Header */}
      <div className="children-header">
        <div className="header-left">
          <div className="page-icon"><ChildIcon /></div>
          <h1>{txt.pageTitle}</h1>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <PlusIcon /> {txt.addChild}
        </button>
      </div>

      {/* Stats */}
      <div className="children-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">👶</div>
          <div className="stat-info">
            <h3>{totalChildren}</h3>
            <p>{txt.totalChildren}</p>
          </div>
        </div>
        <div className="stat-card stat-groups">
          <div className="stat-icon"><GroupIcon /></div>
          <div className="stat-info">
            <h3>{uniqueGroups}</h3>
            <p>{txt.totalGroups}</p>
          </div>
        </div>
        <div className="stat-card stat-age">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{avgAge} {txt.years}</h3>
            <p>{txt.avgAge}</p>
          </div>
        </div>
        <div className="stat-card stat-allergy">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{withAllergies}</h3>
            <p>{txt.withAllergies}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="children-filters">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder={txt.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="group-select"
        >
          <option value="">{txt.allGroups}</option>
          {groups.map(g => (
            <option key={g.id || g._id} value={g.id || g._id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Children Grid - 360 Degree Cards */}
      {filteredChildren.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👶</div>
          <h3>{txt.emptyList}</h3>
          <p>{txt.emptyDesc}</p>
          <button className="add-btn" onClick={openAddModal}>
            <PlusIcon /> {txt.addChild}
          </button>
        </div>
      ) : (
        <div className="children-grid">
          {filteredChildren.map((child, idx) => (
            <motion.div
              key={child.id || child._id}
              className="child-card-360"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Card Header with Avatar */}
              <div className="card-header-360">
                <div 
                  className="child-avatar-360"
                  style={{ background: getAvatarColor(idx) }}
                >
                  {child.firstName?.charAt(0)}{child.lastName?.charAt(0)}
                </div>
                <div className="child-main-info">
                  <h3>{child.firstName} {child.lastName}</h3>
                  <span className="child-age-badge">
                    {calculateAge(child.birthDate)} {txt.years}
                  </span>
                </div>
              </div>

              {/* Card Body - 360 Info */}
              <div className="card-body-360">
                <div className="info-section">
                  <div className="info-row">
                    <span className="info-icon"><GroupIcon /></span>
                    <span className="info-label">{txt.group}</span>
                    <span className="info-value group-badge">{getGroupName(child.groupId)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon"><CalendarIcon /></span>
                    <span className="info-label">{txt.birthDate}</span>
                    <span className="info-value">{formatDate(child.birthDate)}</span>
                  </div>
                </div>

                <div className="info-section parent-section">
                  <div className="section-title">
                    <UserIcon /> {txt.parent}
                  </div>
                  <div className="parent-info">
                    <span className="parent-name">{child.parentName}</span>
                    <a href={`tel:${child.parentPhone}`} className="parent-phone">
                      <PhoneIcon /> {child.parentPhone}
                    </a>
                  </div>
                </div>

                {child.allergies && child.allergies.length > 0 && (
                  <div className="info-section allergy-section">
                    <div className="section-title warning">
                      <AlertIcon /> {txt.allergies}
                    </div>
                    <div className="allergy-tags">
                      {child.allergies.map((allergy, i) => (
                        <span key={i} className="allergy-tag">{allergy}</span>
                      ))}
                    </div>
                  </div>
                )}

                {child.notes && (
                  <div className="info-section notes-section">
                    <div className="section-title">
                      <NoteIcon /> {txt.notes}
                    </div>
                    <p className="notes-text">{child.notes}</p>
                  </div>
                )}
              </div>

              {/* Card Footer - Actions */}
              <div className="card-footer-360">
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/admin/children/${child.id || child._id}`)}
                  title={txt.view}
                >
                  <EyeIcon /> {txt.view}
                </button>
                <button 
                  className="btn-edit"
                  onClick={() => openEditModal(child)}
                  title={txt.edit}
                >
                  <EditIcon />
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(child)}
                  title={txt.delete}
                >
                  <TrashIcon />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Child Form Modal */}
      <ChildFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        child={selectedChild}
        groups={groups}
        onSuccess={fetchData}
        language={language}
      />
    </div>
  )
}

export default ChildrenPage
