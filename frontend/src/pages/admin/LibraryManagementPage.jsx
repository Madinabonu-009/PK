import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './LibraryManagementPage.css'

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
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

const TEXTS = {
  uz: {
    title: 'Kutubxona boshqaruvi',
    addNew: 'Yangi ertak',
    titleUz: 'Sarlavha (UZ)',
    titleRu: 'Sarlavha (RU)',
    titleEn: 'Sarlavha (EN)',
    descUz: 'Tavsif (UZ)',
    descRu: 'Tavsif (RU)',
    descEn: 'Tavsif (EN)',
    moralUz: 'Saboq (UZ)',
    moralRu: 'Saboq (RU)',
    moralEn: 'Saboq (EN)',
    videoUrl: 'YouTube URL',
    emoji: 'Emoji',
    color: 'Rang',
    duration: 'Davomiyligi (daqiqa)',
    characters: 'Qahramonlar (emoji, vergul bilan)',
    order: 'Tartib',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    edit: 'Tahrirlash',
    delete: "O'chirish",
    confirmDelete: "Rostdan ham o'chirmoqchimisiz?",
    noStories: 'Ertaklar yo\'q',
    addFirst: 'Birinchi ertakni qo\'shing',
    success: 'Muvaffaqiyatli saqlandi!',
    deleted: "O'chirildi!",
    error: 'Xatolik yuz berdi',
    seed: 'Namuna ertaklar',
    seeded: 'Namuna ertaklar qo\'shildi!'
  },
  ru: {
    title: 'Управление библиотекой',
    addNew: 'Новая сказка',
    titleUz: 'Название (UZ)',
    titleRu: 'Название (RU)',
    titleEn: 'Название (EN)',
    descUz: 'Описание (UZ)',
    descRu: 'Описание (RU)',
    descEn: 'Описание (EN)',
    moralUz: 'Мораль (UZ)',
    moralRu: 'Мораль (RU)',
    moralEn: 'Мораль (EN)',
    videoUrl: 'YouTube URL',
    emoji: 'Эмодзи',
    color: 'Цвет',
    duration: 'Длительность (мин)',
    characters: 'Персонажи (эмодзи через запятую)',
    order: 'Порядок',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirmDelete: 'Вы уверены?',
    noStories: 'Нет сказок',
    addFirst: 'Добавьте первую сказку',
    success: 'Успешно сохранено!',
    deleted: 'Удалено!',
    error: 'Произошла ошибка',
    seed: 'Примеры сказок',
    seeded: 'Примеры добавлены!'
  },
  en: {
    title: 'Library Management',
    addNew: 'New Story',
    titleUz: 'Title (UZ)',
    titleRu: 'Title (RU)',
    titleEn: 'Title (EN)',
    descUz: 'Description (UZ)',
    descRu: 'Description (RU)',
    descEn: 'Description (EN)',
    moralUz: 'Moral (UZ)',
    moralRu: 'Moral (RU)',
    moralEn: 'Moral (EN)',
    videoUrl: 'YouTube URL',
    emoji: 'Emoji',
    color: 'Color',
    duration: 'Duration (min)',
    characters: 'Characters (emoji, comma separated)',
    order: 'Order',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure?',
    noStories: 'No stories',
    addFirst: 'Add your first story',
    success: 'Saved successfully!',
    deleted: 'Deleted!',
    error: 'An error occurred',
    seed: 'Sample Stories',
    seeded: 'Samples added!'
  }
}

function StoryFormModal({ isOpen, onClose, story, onSuccess, language }) {
  const txt = TEXTS[language]
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    moral: { uz: '', ru: '', en: '' },
    videoUrl: '', emoji: '📖', color: '#667eea', duration: 5, characters: '', order: 0
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && story) {
      setFormData({
        title: story.title || { uz: '', ru: '', en: '' },
        description: story.description || { uz: '', ru: '', en: '' },
        moral: story.moral || { uz: '', ru: '', en: '' },
        videoUrl: story.videoUrl || '',
        emoji: story.emoji || '📖',
        color: story.color || '#667eea',
        duration: story.duration || 5,
        characters: (story.characters || []).join(', '),
        order: story.order || 0
      })
    } else if (isOpen) {
      setFormData({
        title: { uz: '', ru: '', en: '' },
        description: { uz: '', ru: '', en: '' },
        moral: { uz: '', ru: '', en: '' },
        videoUrl: '', emoji: '📖', color: '#667eea', duration: 5, characters: '', order: 0
      })
    }
  }, [isOpen, story])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.uz.trim()) return toast.error('Sarlavha kiritilishi shart')
    
    setSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        moral: formData.moral,
        videoUrl: formData.videoUrl.trim(),
        emoji: formData.emoji.trim() || '📖',
        color: formData.color,
        duration: parseInt(formData.duration) || 5,
        characters: formData.characters.split(',').map(c => c.trim()).filter(Boolean),
        order: parseInt(formData.order) || 0
      }
      
      if (story) {
        await api.put(`/library/${story._id}`, payload)
      } else {
        await api.post('/library', payload)
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

  const updateTitle = (lang, val) => setFormData(p => ({ ...p, title: { ...p.title, [lang]: val } }))
  const updateDesc = (lang, val) => setFormData(p => ({ ...p, description: { ...p.description, [lang]: val } }))
  const updateMoral = (lang, val) => setFormData(p => ({ ...p, moral: { ...p.moral, [lang]: val } }))

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div className="lm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="lm-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
          <div className="lm-modal-header">
            <h2>{story ? txt.edit : txt.addNew}</h2>
            <button className="lm-close-btn" onClick={onClose}><CloseIcon /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="lm-form">
            <div className="lm-form-grid">
              <div className="lm-field"><label>{txt.titleUz} *</label><input type="text" value={formData.title.uz} onChange={e => updateTitle('uz', e.target.value)} required /></div>
              <div className="lm-field"><label>{txt.titleRu}</label><input type="text" value={formData.title.ru} onChange={e => updateTitle('ru', e.target.value)} /></div>
              <div className="lm-field"><label>{txt.titleEn}</label><input type="text" value={formData.title.en} onChange={e => updateTitle('en', e.target.value)} /></div>
              
              <div className="lm-field"><label>{txt.emoji}</label><input type="text" value={formData.emoji} onChange={e => setFormData(p => ({ ...p, emoji: e.target.value }))} /></div>
              <div className="lm-field"><label>{txt.color}</label><input type="color" value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))} /></div>
              <div className="lm-field"><label>{txt.duration}</label><input type="number" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} min="1" /></div>
              
              <div className="lm-field full-width"><label>{txt.videoUrl}</label><input type="url" value={formData.videoUrl} onChange={e => setFormData(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/..." /></div>
              <div className="lm-field full-width"><label>{txt.characters}</label><input type="text" value={formData.characters} onChange={e => setFormData(p => ({ ...p, characters: e.target.value }))} placeholder="🐻, 👧, 🐺" /></div>
              
              <div className="lm-field full-width"><label>{txt.descUz}</label><textarea value={formData.description.uz} onChange={e => updateDesc('uz', e.target.value)} rows={2} /></div>
              <div className="lm-field full-width"><label>{txt.moralUz}</label><textarea value={formData.moral.uz} onChange={e => updateMoral('uz', e.target.value)} rows={2} /></div>
              
              <div className="lm-field"><label>{txt.order}</label><input type="number" value={formData.order} onChange={e => setFormData(p => ({ ...p, order: e.target.value }))} /></div>
            </div>
            
            <div className="lm-modal-footer">
              <button type="button" className="lm-btn-cancel" onClick={onClose}>{txt.cancel}</button>
              <button type="submit" className="lm-btn-save" disabled={submitting}>{submitting ? '...' : txt.save}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function LibraryManagementPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language]
  
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/library')
      setStories(res.data?.data || (Array.isArray(res.data) ? res.data : []))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (story) => {
    if (!window.confirm(txt.confirmDelete)) return
    try {
      await api.delete(`/library/${story._id}`)
      toast.success(txt.deleted)
      fetchData()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  const handleSeed = async () => {
    try {
      await api.post('/library/seed')
      toast.success(txt.seeded)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || txt.error)
    }
  }

  const openEdit = (story) => { setEditingStory(story); setModalOpen(true) }
  const openAdd = () => { setEditingStory(null); setModalOpen(true) }

  return (
    <div className="lm-page">
      <div className="lm-header">
        <div className="lm-header-left">
          <div className="lm-icon"><BookIcon /></div>
          <h1>{txt.title}</h1>
        </div>
        <div className="lm-header-actions">
          <button className="lm-seed-btn" onClick={handleSeed}>📚 12 ta ertak yuklash</button>
          <button className="lm-add-btn" onClick={openAdd}><PlusIcon /> {txt.addNew}</button>
        </div>
      </div>

      {loading ? (
        <div className="lm-loading"><div className="lm-spinner"></div></div>
      ) : stories.length === 0 ? (
        <div className="lm-empty">
          <BookIcon />
          <h3>{txt.noStories}</h3>
          <p>{txt.addFirst}</p>
          <button className="lm-add-btn" onClick={openAdd}><PlusIcon /> {txt.addNew}</button>
        </div>
      ) : (
        <div className="lm-grid">
          {stories.map((story, idx) => (
            <motion.div key={story._id} className="lm-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ '--card-color': story.color }}>
              <div className="lm-card-header" style={{ background: story.color }}>
                <span className="lm-emoji">{story.emoji}</span>
                <span className="lm-duration">{story.duration} min</span>
              </div>
              <div className="lm-card-info">
                <h3>{story.title?.[language] || story.title?.uz}</h3>
                <p>{story.description?.[language] || story.description?.uz}</p>
                <div className="lm-characters">
                  {(story.characters || []).map((c, i) => <span key={i}>{c}</span>)}
                </div>
              </div>
              <div className="lm-card-actions">
                <button className="lm-edit-btn" onClick={() => openEdit(story)}><EditIcon /> {txt.edit}</button>
                <button className="lm-delete-btn" onClick={() => handleDelete(story)}><TrashIcon /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <StoryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} story={editingStory} onSuccess={fetchData} language={language} />
    </div>
  )
}
