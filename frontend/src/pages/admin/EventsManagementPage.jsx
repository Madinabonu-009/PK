import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './EventsManagementPage.css'

const EventsManagementPage = () => {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState({
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    date: '',
    time: '',
    type: 'event',
    color: '#3b82f6',
    published: true
  })

  useEffect(() => {
    let isMounted = true
    
    const loadEvents = async () => {
      if (isMounted) {
        await fetchEvents()
      }
    }
    
    loadEvents()
    
    return () => {
      isMounted = false
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?all=true')
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, form)
        toast.success('Tadbir yangilandi!')
      } else {
        await api.post('/events', form)
        toast.success('Tadbir qo\'shildi!')
      }
      fetchEvents()
      closeModal()
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/events/${id}`)
      fetchEvents()
      toast.success('O\'chirildi!')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const togglePublish = async (event) => {
    try {
      await api.put(`/events/${event.id}`, { ...event, published: !event.published })
      fetchEvents()
      toast.success(event.published ? 'Yashirildi' : 'Chop etildi')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
  }

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event)
      setForm({
        title: event.title || { uz: '', ru: '', en: '' },
        description: event.description || { uz: '', ru: '', en: '' },
        date: event.date || '',
        time: event.time || '',
        type: event.type || 'event',
        color: event.color || '#3b82f6',
        published: event.published !== false
      })
    } else {
      setEditingEvent(null)
      setForm({
        title: { uz: '', ru: '', en: '' },
        description: { uz: '', ru: '', en: '' },
        date: '',
        time: '',
        type: 'event',
        color: '#3b82f6',
        published: true
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'holiday': return '🟢 Bayram'
      case 'event': return '🔵 Tadbir'
      case 'important': return '🔴 Muhim'
      default: return type
    }
  }

  return (
    <div className="events-management-page">
      <div className="page-header">
        <h1>📅 Tadbirlar boshqaruvi</h1>
        <button className="add-btn" onClick={() => openModal()}>+ Yangi tadbir</button>
      </div>

      {loading ? (
        <div className="loading">Yuklanmoqda...</div>
      ) : (
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Sana</th>
                <th>Nomi</th>
                <th>Turi</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>
                    <div className="date-cell">
                      <span className="date-day">{new Date(event.date).getDate()}</span>
                      <span className="date-month">{new Date(event.date).toLocaleDateString('uz-UZ', { month: 'short' })}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{event.title?.uz || event.title}</strong>
                    {event.time && <span className="event-time">🕐 {event.time}</span>}
                  </td>
                  <td><span className="type-badge" style={{ background: event.color }}>{getTypeLabel(event.type)}</span></td>
                  <td>
                    <span className={`status-badge ${event.published ? 'published' : 'draft'}`}>
                      {event.published ? '✅ Chop etilgan' : '📝 Qoralama'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn edit" onClick={() => openModal(event)}>✏️</button>
                      <button className="action-btn toggle" onClick={() => togglePublish(event)}>
                        {event.published ? '🔒' : '🔓'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(event.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingEvent ? 'Tahrirlash' : 'Yangi tadbir'}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sana</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Vaqt (ixtiyoriy)</label>
                    <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Turi</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="holiday">🟢 Bayram</option>
                      <option value="event">🔵 Tadbir</option>
                      <option value="important">🔴 Muhim</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rang</label>
                    <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nomi (UZ)</label>
                  <input type="text" value={form.title.uz} onChange={e => setForm({...form, title: {...form.title, uz: e.target.value}})} required />
                </div>
                <div className="form-group">
                  <label>Nomi (RU)</label>
                  <input type="text" value={form.title.ru} onChange={e => setForm({...form, title: {...form.title, ru: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Tavsif (UZ)</label>
                  <textarea value={form.description.uz} onChange={e => setForm({...form, description: {...form.description, uz: e.target.value}})} rows={3} />
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} />
                    Chop etish
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeModal}>Bekor qilish</button>
                  <button type="submit" className="save-btn">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventsManagementPage