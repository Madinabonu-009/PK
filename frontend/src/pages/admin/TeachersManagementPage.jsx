import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './TeachersManagementPage.css'

// Icons
const TeacherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const CATEGORIES = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'teacher', label: { uz: 'Tarbiyachilar', ru: 'Воспитатели', en: 'Teachers' } },
  { id: 'specialist', label: { uz: 'Mutaxassislar', ru: 'Специалисты', en: 'Specialists' } },
  { id: 'medical', label: { uz: 'Tibbiyot', ru: 'Медицина', en: 'Medical' } },
  { id: 'staff', label: { uz: 'Xodimlar', ru: 'Персонал', en: 'Staff' } }
]

const TEXTS = {
  uz: {
    title: 'Xodimlar boshqaruvi',
    addNew: 'Yangi xodim',
    name: 'Ism familiya',
    position: 'Lavozim',
    category: 'Kategoriya',
    phone: 'Telefon',
    email: 'Email',
    education: 'Ma\'lumoti',
    experience: 'Tajriba',
    bio: 'Qisqacha ma\'lumot',
    photo: 'Rasm URL',
    group: 'Guruh',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    confirmDelete: 'Rostdan ham o\'chirmoqchimisiz?',
    noTeachers: 'Xodimlar yo\'q',
    addFirst: 'Birinchi xodimni qo\'shing',
    success: 'Muvaffaqiyatli saqlandi!',
    deleted: 'O\'chirildi!',
    error: 'Xatolik yuz berdi'
  },
  ru: {
    title: 'Управление сотрудниками',
    addNew: 'Новый сотрудник',
    name: 'ФИО',
    position: 'Должность',
    category: 'Категория',
    phone: 'Телефон',
    email: 'Email',
    education: 'Образование',
    experience: 'Опыт',
    bio: 'Краткая информация',
    photo: 'URL фото',
    group: 'Группа',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить?',
    noTeachers: 'Нет сотрудников',
    addFirst: 'Добавьте первого сотрудника',
    success: 'Успешно сохранено!',
    deleted: 'Удалено!',
    error: 'Произошла ошибка'
  },
  en: {
    title: 'Staff Management',
    addNew: 'New Staff',
    name: 'Full Name',
    position: 'Position',
    category: 'Category',
    phone: 'Phone',
    email: 'Email',
    education: 'Education',
    experience: 'Experience',
    bio: 'Short Bio',
    photo: 'Photo URL',
    group: 'Group',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete?',
    noTeachers: 'No staff members',
    addFirst: 'Add your first staff member',
    success: 'Saved successfully!',
    deleted: 'Deleted!',
    error: 'An error occurred'
  }
}


// Teacher Form Modal
function TeacherFormModal({ isOpen, onClose, teacher, groups, onSuccess, language }) {
  const txt = TEXTS[language]
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    name: '', position: '', category: 'teacher', phone: '', email: '',
    education: '', experience: '', bio: '', photo: '', group: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const getStringValue = (val) => {
    if (!val) return ''
    if (typeof val === 'object') return val.uz || val.ru || val.en || ''
    return String(val)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllari!')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fayl hajmi 5MB dan oshmasligi kerak')
      return
    }
    
    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      
      const response = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const uploadedUrl = response.data?.url || response.data?.path
      if (uploadedUrl) {
        setFormData(p => ({ ...p, photo: uploadedUrl }))
        toast.success('Rasm yuklandi!')
      }
    } catch (err) {
      toast.error('Rasm yuklashda xatolik')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        name: getStringValue(teacher.name),
        position: getStringValue(teacher.position) || getStringValue(teacher.role),
        category: teacher.category || 'teacher',
        phone: getStringValue(teacher.phone),
        email: getStringValue(teacher.email),
        education: getStringValue(teacher.education),
        experience: getStringValue(teacher.experience),
        bio: getStringValue(teacher.bio),
        photo: getStringValue(teacher.photo),
        group: getStringValue(teacher.group)
      })
    } else if (isOpen) {
      setFormData({
        name: '', position: '', category: 'teacher', phone: '', email: '',
        education: '', experience: '', bio: '', photo: '', group: ''
      })
    }
  }, [isOpen, teacher])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error('Ism kiritilishi shart')
    
    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' '),
        position: formData.position.trim(),
        role: formData.position.trim(),
        category: formData.category,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        education: formData.education.trim(),
        experience: formData.experience.trim(),
        bio: formData.bio.trim(),
        photo: formData.photo.trim() || '/images/default-avatar.png',
        group: formData.group
      }
      
      if (teacher) {
        await api.put(`/teachers/${teacher.id || teacher._id}`, payload)
      } else {
        await api.post('/teachers', payload)
      }
      
      toast.success(txt.success)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || txt.error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div className="tm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="tm-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
          <div className="tm-modal-header">
            <h2>{teacher ? txt.edit : txt.addNew}</h2>
            <button className="tm-close-btn" onClick={onClose}><CloseIcon /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="tm-form">
            <div className="tm-form-grid">
              <div className="tm-field">
                <label>{txt.name} *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ism Familiya" required />
              </div>
              
              <div className="tm-field">
                <label>{txt.position}</label>
                <input type="text" value={formData.position} onChange={e => setFormData(p => ({ ...p, position: e.target.value }))} placeholder="Tarbiyachi, Logoped..." />
              </div>
              
              <div className="tm-field">
                <label>{txt.category}</label>
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label[language]}</option>
                  ))}
                </select>
              </div>
              
              <div className="tm-field">
                <label>{txt.group}</label>
                <select value={formData.group} onChange={e => setFormData(p => ({ ...p, group: e.target.value }))}>
                  <option value="">-- Tanlang --</option>
                  {groups.map(g => (
                    <option key={g.id || g._id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="tm-field">
                <label>{txt.phone}</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 123 45 67" />
              </div>
              
              <div className="tm-field">
                <label>{txt.email}</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              
              <div className="tm-field">
                <label>{txt.education}</label>
                <input type="text" value={formData.education} onChange={e => setFormData(p => ({ ...p, education: e.target.value }))} placeholder="Oliy ma'lumot" />
              </div>
              
              <div className="tm-field">
                <label>{txt.experience}</label>
                <input type="text" value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} placeholder="5 yil" />
              </div>
              
              <div className="tm-field full-width">
                <label>{txt.photo}</label>
                <div className="tm-photo-upload">
                  <input 
                    type="text" 
                    value={formData.photo} 
                    onChange={e => setFormData(p => ({ ...p, photo: e.target.value }))} 
                    placeholder="URL yoki fayl yuklang" 
                  />
                  <label className="tm-upload-btn">
                    {uploading ? '⏳' : '📷'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                {formData.photo && (
                  <img src={formData.photo} alt="Preview" className="tm-photo-preview" onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              
              <div className="tm-field full-width">
                <label>{txt.bio}</label>
                <textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} placeholder="Qisqacha ma'lumot..." rows={3} />
              </div>
            </div>
            
            <div className="tm-modal-footer">
              <button type="button" className="tm-btn-cancel" onClick={onClose}>{txt.cancel}</button>
              <button type="submit" className="tm-btn-save" disabled={submitting}>
                {submitting ? '...' : txt.save}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Component
export default function TeachersManagementPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [groups, setGroups] = useState([])
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [teachersRes, groupsRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/groups')
      ])
      setTeachers(teachersRes.data?.data || (Array.isArray(teachersRes.data) ? teachersRes.data : []))
      setGroups(groupsRes.data?.data || (Array.isArray(groupsRes.data) ? groupsRes.data : []))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (teacher) => {
    if (!window.confirm(txt.confirmDelete)) return
    try {
      await api.delete(`/teachers/${teacher.id || teacher._id}`)
      toast.success(txt.deleted)
      fetchData()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  const openEdit = (teacher) => {
    setEditingTeacher(teacher)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditingTeacher(null)
    setModalOpen(true)
  }

  const filtered = filter === 'all' ? teachers : teachers.filter(t => t.category === filter)

  return (
    <div className="tm-page">
      <div className="tm-header">
        <div className="tm-header-left">
          <div className="tm-icon"><TeacherIcon /></div>
          <h1>{txt.title}</h1>
        </div>
        <button className="tm-add-btn" onClick={openAdd}>
          <PlusIcon /> {txt.addNew}
        </button>
      </div>

      <div className="tm-filters">
        {CATEGORIES.map(cat => (
          <button key={cat.id} className={`tm-filter-btn ${filter === cat.id ? 'active' : ''}`} onClick={() => setFilter(cat.id)}>
            {cat.label[language]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tm-loading"><div className="tm-spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="tm-empty">
          <TeacherIcon />
          <h3>{txt.noTeachers}</h3>
          <p>{txt.addFirst}</p>
          <button className="tm-add-btn" onClick={openAdd}><PlusIcon /> {txt.addNew}</button>
        </div>
      ) : (
        <div className="tm-grid">
          {filtered.map((teacher, idx) => {
            const teacherName = typeof teacher.name === 'object' ? (teacher.name[language] || teacher.name.uz || '') : (teacher.name || '')
            const teacherPosition = typeof teacher.position === 'object' ? (teacher.position[language] || teacher.position.uz || '') : (teacher.position || teacher.role || '')
            const teacherGroup = typeof teacher.group === 'object' ? (teacher.group[language] || teacher.group.uz || '') : (teacher.group || '')
            const teacherPhone = teacher.phone || ''
            const teacherExp = typeof teacher.experience === 'object' ? (teacher.experience[language] || teacher.experience.uz || '') : (teacher.experience || '')
            
            return (
            <motion.div key={teacher.id || teacher._id} className="tm-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <div className="tm-card-photo">
                <img src={teacher.photo || '/images/default-avatar.png'} alt={teacherName} onError={e => e.target.src = '/images/default-avatar.png'} />
                <span className={`tm-category-badge ${teacher.category}`}>
                  {CATEGORIES.find(c => c.id === teacher.category)?.label[language] || teacher.category}
                </span>
              </div>
              <div className="tm-card-info">
                <h3>{teacherName}</h3>
                <p className="tm-position">{teacherPosition}</p>
                {teacherGroup && <p className="tm-group">📍 {teacherGroup}</p>}
                {teacherPhone && <p className="tm-phone">📞 {teacherPhone}</p>}
                {teacherExp && <p className="tm-exp">⏱️ {teacherExp}</p>}
              </div>
              <div className="tm-card-actions">
                <button className="tm-edit-btn" onClick={() => openEdit(teacher)}><EditIcon /> {txt.edit}</button>
                <button className="tm-delete-btn" onClick={() => handleDelete(teacher)}><TrashIcon /></button>
              </div>
            </motion.div>
          )})}
        </div>
      )}

      <TeacherFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        teacher={editingTeacher}
        groups={groups}
        onSuccess={fetchData}
        language={language}
      />
    </div>
  )
}
