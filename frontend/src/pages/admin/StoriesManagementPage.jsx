import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './StoriesManagementPage.css'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 
                 (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/images/')) return url
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

const StoriesManagementPage = () => {
  const toast = useToast()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStory, setEditingStory] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState('file')
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    media: []
  })
  const [newMedia, setNewMedia] = useState({ type: 'image', url: '', caption: '' })

  useEffect(() => { fetchStories() }, [])

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories')
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setStories(data)
    } catch (error) {
      console.error('Failed to fetch stories')
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload?folder=stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setNewMedia(prev => ({
        ...prev,
        url: response.data.url,
        type: response.data.type
      }))
    } catch (error) {
      toast.error('Fayl yuklashda xatolik: ' + (error.response?.data?.error || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.media.length === 0) {
      toast.warning('Kamida 1 ta rasm/video qo\'shing')
      return
    }
    try {
      if (editingStory) {
        await api.put(`/stories/${editingStory.id}`, form)
        toast.success('Story yangilandi!')
      } else {
        await api.post('/stories', form)
        toast.success('Story qo\'shildi!')
      }
      fetchStories()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/stories/${id}`)
      fetchStories()
      toast.success('O\'chirildi!')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const addMedia = () => {
    if (!newMedia.url) {
      toast.warning('Avval fayl yuklang yoki URL kiriting')
      return
    }
    setForm(prev => ({
      ...prev,
      media: [...prev.media, { ...newMedia, id: Date.now() }]
    }))
    setNewMedia({ type: 'image', url: '', caption: '' })
    setUploadMode('file')
  }

  const removeMedia = (id) => {
    setForm(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== id)
    }))
  }

  const openModal = (story = null) => {
    if (story) {
      setEditingStory(story)
      setForm({
        date: story.date,
        description: story.description || '',
        media: story.media || []
      })
    } else {
      setEditingStory(null)
      setForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        media: []
      })
    }
    setNewMedia({ type: 'image', url: '', caption: '' })
    setUploadMode('file')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingStory(null)
    setNewMedia({ type: 'image', url: '', caption: '' })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="stories-management-page">
      <div className="page-header">
        <h1>Bugun (Stories) boshqaruvi</h1>
        <button className="add-btn" onClick={() => openModal()}>+ Yangi story</button>
      </div>

      {loading ? (
        <div className="loading">Yuklanmoqda...</div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
          <p>Hali story yo'q</p>
          <button onClick={() => openModal()}>Birinchi story qo'shish</button>
        </div>
      ) : (
        <div className="stories-list">
          {stories.map(story => (
            <motion.div key={story.id} className="story-card" layout>
              <div className="story-header">
                <div className="story-date">
                  <span className="date-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <span>{formatDate(story.date)}</span>
                </div>
                <div className="story-actions">
                  <button className="action-btn edit" onClick={() => openModal(story)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button className="action-btn delete" onClick={() => handleDelete(story.id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </div>
              <div className="story-media-grid">
                {story.media?.slice(0, 4).map((m, i) => (
                  <div key={i} className="media-thumb">
                    {m.type === 'image' ? (
                      <img src={getFullUrl(m.url)} alt={m.caption} />
                    ) : (
                      <div className="video-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                    )}
                    {i === 3 && story.media.length > 4 && (
                      <div className="more-overlay">+{story.media.length - 4}</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="story-description">{story.description}</p>
              <div className="story-stats">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {story.views || 0} ko'rildi</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> {story.media?.length || 0} ta media</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className="modal large" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingStory ? 'Story tahrirlash' : 'Yangi story'}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sana</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tavsif</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="Bugun nima qildik..." />
                </div>

                {/* Media qo'shish */}
                <div className="media-section">
                  <h4>Media qo'shish</h4>
                  
                  {/* Upload mode toggle */}
                  <div className="upload-mode-toggle">
                    <button 
                      type="button" 
                      className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
                      onClick={() => setUploadMode('file')}
                    >
                      Fayldan
                    </button>
                    <button 
                      type="button" 
                      className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
                      onClick={() => setUploadMode('url')}
                    >
                      URL
                    </button>
                  </div>

                  <div className="add-media-form">
                    {uploadMode === 'file' ? (
                      <div className="file-upload-compact">
                        {uploading ? (
                          <div className="upload-status">
                            <div className="spinner-small"></div>
                            <span>Yuklanmoqda...</span>
                          </div>
                        ) : newMedia.url ? (
                          <div className="upload-status success">
                            <span>{newMedia.type === 'image' ? 'Rasm' : 'Video'} Yuklandi</span>
                            <button type="button" onClick={() => setNewMedia(prev => ({...prev, url: ''}))} className="clear-btn">×</button>
                          </div>
                        ) : (
                          <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                            Fayl tanlash
                          </button>
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*,video/*" 
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : (
                      <>
                        <select value={newMedia.type} onChange={e => setNewMedia({...newMedia, type: e.target.value})}>
                          <option value="image">Rasm</option>
                          <option value="video">Video</option>
                        </select>
                        <input type="url" value={newMedia.url} onChange={e => setNewMedia({...newMedia, url: e.target.value})} placeholder="URL manzili" />
                      </>
                    )}
                    <input type="text" value={newMedia.caption} onChange={e => setNewMedia({...newMedia, caption: e.target.value})} placeholder="Izoh" />
                    <button type="button" onClick={addMedia} disabled={!newMedia.url || uploading}>+</button>
                  </div>

                  {/* Qo'shilgan medialar */}
                  {form.media.length > 0 && (
                    <div className="media-list">
                      {form.media.map(m => (
                        <div key={m.id} className="media-item">
                          {m.type === 'image' ? (
                            <img src={getFullUrl(m.url)} alt={m.caption} className="media-thumb-small" />
                          ) : (
                            <span className="media-type-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
                          )}
                          <span className="media-caption">{m.caption || 'Izohsiz'}</span>
                          <button type="button" onClick={() => removeMedia(m.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeModal}>Bekor qilish</button>
                  <button type="submit" className="save-btn" disabled={form.media.length === 0}>Saqlash</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StoriesManagementPage
