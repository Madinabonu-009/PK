import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './FeedbackManagementPage.css'

const TEXTS = {
  uz: {
    title: 'Fikrlar va Xabarlar',
    subtitle: 'Ota-onalar fikrlari va aloqa xabarlari',
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    all: 'Barchasi',
    feedbacks: 'Fikrlar',
    contacts: 'Aloqa xabarlari',
    search: 'Qidirish...',
    noFeedbacks: 'Fikrlar yo\'q',
    noContacts: 'Xabarlar yo\'q',
    anonymous: 'Anonim',
    approve: 'Tasdiqlash',
    delete: 'O\'chirish',
    confirmDelete: 'O\'chirishni tasdiqlaysizmi?',
    total: 'Jami',
    avgRating: 'O\'rtacha baho',
    new: 'Yangi',
    read: 'O\'qilgan',
    markRead: 'O\'qilgan deb belgilash',
    phone: 'Telefon',
    email: 'Email',
    message: 'Xabar'
  },
  ru: {
    title: 'Отзывы и Сообщения',
    subtitle: 'Отзывы родителей и контактные сообщения',
    pending: 'Ожидает',
    approved: 'Одобрено',
    all: 'Все',
    feedbacks: 'Отзывы',
    contacts: 'Сообщения',
    search: 'Поиск...',
    noFeedbacks: 'Нет отзывов',
    noContacts: 'Нет сообщений',
    anonymous: 'Аноним',
    approve: 'Одобрить',
    delete: 'Удалить',
    confirmDelete: 'Подтвердите удаление',
    total: 'Всего',
    avgRating: 'Средний рейтинг',
    new: 'Новое',
    read: 'Прочитано',
    markRead: 'Отметить прочитанным',
    phone: 'Телефон',
    email: 'Email',
    message: 'Сообщение'
  },
  en: {
    title: 'Feedback & Messages',
    subtitle: 'Parent feedback and contact messages',
    pending: 'Pending',
    approved: 'Approved',
    all: 'All',
    feedbacks: 'Feedback',
    contacts: 'Messages',
    search: 'Search...',
    noFeedbacks: 'No feedback',
    noContacts: 'No messages',
    anonymous: 'Anonymous',
    approve: 'Approve',
    delete: 'Delete',
    confirmDelete: 'Confirm delete?',
    total: 'Total',
    avgRating: 'Avg Rating',
    new: 'New',
    read: 'Read',
    markRead: 'Mark as read',
    phone: 'Phone',
    email: 'Email',
    message: 'Message'
  }
}

export default function FeedbackManagementPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language] || TEXTS.uz
  
  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState([])
  const [pendingFeedbacks, setPendingFeedbacks] = useState([])
  const [contacts, setContacts] = useState([])
  const [activeTab, setActiveTab] = useState('contacts') // Default to contacts
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [allRes, pendingRes, contactsRes] = await Promise.all([
        api.get('/feedback'),
        api.get('/feedback/pending'),
        api.get('/contact').catch(() => ({ data: [] }))
      ])
      setFeedbacks(allRes.data?.data || allRes.data || [])
      setPendingFeedbacks(pendingRes.data?.data || pendingRes.data || [])
      setContacts(contactsRes.data?.data || contactsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.put(`/feedback/${id}/approve`)
      toast.success('Tasdiqlandi!')
      fetchData()
    } catch {
      toast.error('Xatolik')
    }
  }

  const handleDelete = async (id, type = 'feedback') => {
    if (!window.confirm(txt.confirmDelete)) return
    try {
      if (type === 'contact') {
        await api.delete(`/contact/${id}`)
      } else {
        await api.delete(`/feedback/${id}`)
      }
      toast.success('O\'chirildi!')
      fetchData()
    } catch {
      toast.error('Xatolik')
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/contact/${id}`, { status: 'read' })
      toast.success('O\'qilgan deb belgilandi')
      fetchData()
    } catch {
      toast.error('Xatolik')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Stats
  const total = feedbacks.length + pendingFeedbacks.length
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) 
    : '0'
  const newContacts = contacts.filter(c => c.status === 'new').length

  // Filter
  let list = []
  if (activeTab === 'contacts') {
    list = contacts
  } else if (activeTab === 'pending') {
    list = pendingFeedbacks
  } else if (activeTab === 'approved') {
    list = feedbacks
  } else {
    list = [...pendingFeedbacks, ...feedbacks]
  }
  
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(f => 
      f.parentName?.toLowerCase().includes(q) || 
      f.comment?.toLowerCase().includes(q) ||
      f.name?.toLowerCase().includes(q) ||
      f.message?.toLowerCase().includes(q) ||
      f.phone?.includes(q)
    )
  }

  if (loading) {
    return <div className="fbm-loading">Yuklanmoqda...</div>
  }

  return (
    <div className="fbm-page">
      {/* Header */}
      <div className="fbm-header">
        <div>
          <h1>{txt.title}</h1>
          <p>{txt.subtitle}</p>
        </div>
        <div className="fbm-stats">
          <div className="fbm-stat">
            <span className="fbm-stat-value">{contacts.length}</span>
            <span className="fbm-stat-label">{txt.contacts}</span>
          </div>
          <div className="fbm-stat">
            <span className="fbm-stat-value">{newContacts}</span>
            <span className="fbm-stat-label">{txt.new}</span>
          </div>
          <div className="fbm-stat">
            <span className="fbm-stat-value">{total}</span>
            <span className="fbm-stat-label">{txt.feedbacks}</span>
          </div>
          <div className="fbm-stat">
            <span className="fbm-stat-value">{avgRating}</span>
            <span className="fbm-stat-label">{txt.avgRating}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fbm-toolbar">
        <div className="fbm-tabs">
          <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>
            📩 {txt.contacts} ({contacts.length})
          </button>
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
            ⏳ {txt.pending} ({pendingFeedbacks.length})
          </button>
          <button className={activeTab === 'approved' ? 'active' : ''} onClick={() => setActiveTab('approved')}>
            ✅ {txt.approved} ({feedbacks.length})
          </button>
        </div>
        <input 
          type="text" 
          placeholder={txt.search} 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="fbm-search"
        />
      </div>

      {/* List */}
      <div className="fbm-list">
        {list.length === 0 ? (
          <div className="fbm-empty">{activeTab === 'contacts' ? txt.noContacts : txt.noFeedbacks}</div>
        ) : activeTab === 'contacts' ? (
          // Contact messages
          list.map(item => (
            <div key={item.id} className={`fbm-card ${item.status === 'new' ? 'pending' : ''}`}>
              <div className="fbm-card-top">
                <div className="fbm-author">
                  <div className="fbm-avatar">{item.name?.[0] || '?'}</div>
                  <div>
                    <div className="fbm-name">{item.name || txt.anonymous}</div>
                    <div className="fbm-date">{formatDate(item.createdAt)}</div>
                  </div>
                </div>
                <span className={`fbm-status ${item.status === 'new' ? 'pending' : 'approved'}`}>
                  {item.status === 'new' ? txt.new : txt.read}
                </span>
              </div>
              <div className="fbm-contact-info">
                {item.phone && <span>📞 {item.phone}</span>}
                {item.email && <span>📧 {item.email}</span>}
              </div>
              <p className="fbm-comment">{item.message}</p>
              <div className="fbm-card-bottom">
                <span className="fbm-source">{item.source === 'landing' ? '🌐 Landing' : '📝 Contact'}</span>
                <div className="fbm-actions">
                  {item.status === 'new' && (
                    <button className="fbm-btn approve" onClick={() => handleMarkRead(item.id)}>
                      {txt.markRead}
                    </button>
                  )}
                  <button className="fbm-btn delete" onClick={() => handleDelete(item.id, 'contact')}>
                    {txt.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Feedback items
          list.map(item => (
            <div key={item.id} className={`fbm-card ${!item.isApproved ? 'pending' : ''}`}>
              <div className="fbm-card-top">
                <div className="fbm-author">
                  <div className="fbm-avatar">{item.parentName?.[0] || '?'}</div>
                  <div>
                    <div className="fbm-name">{item.parentName || txt.anonymous}</div>
                    <div className="fbm-date">{formatDate(item.createdAt)}</div>
                  </div>
                </div>
                <div className="fbm-rating">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={i <= item.rating ? 'filled' : ''}>★</span>
                  ))}
                </div>
              </div>
              <p className="fbm-comment">{item.comment}</p>
              <div className="fbm-card-bottom">
                <span className={`fbm-status ${item.isApproved ? 'approved' : 'pending'}`}>
                  {item.isApproved ? txt.approved : txt.pending}
                </span>
                <div className="fbm-actions">
                  {!item.isApproved && (
                    <button className="fbm-btn approve" onClick={() => handleApprove(item.id)}>
                      {txt.approve}
                    </button>
                  )}
                  <button className="fbm-btn delete" onClick={() => handleDelete(item.id)}>
                    {txt.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
