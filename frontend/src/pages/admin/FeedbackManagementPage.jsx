import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './FeedbackManagementPage.css'

const TEXTS = {
  uz: {
    title: 'Fikrlar',
    subtitle: 'Ota-onalar fikrlari',
    pending: 'Kutilmoqda',
    approved: 'Tasdiqlangan',
    all: 'Barchasi',
    search: 'Qidirish...',
    noFeedbacks: 'Fikrlar yo\'q',
    anonymous: 'Anonim',
    approve: 'Tasdiqlash',
    delete: 'O\'chirish',
    confirmDelete: 'O\'chirishni tasdiqlaysizmi?',
    total: 'Jami',
    avgRating: 'O\'rtacha baho'
  },
  ru: {
    title: 'Отзывы',
    subtitle: 'Отзывы родителей',
    pending: 'Ожидает',
    approved: 'Одобрено',
    all: 'Все',
    search: 'Поиск...',
    noFeedbacks: 'Нет отзывов',
    anonymous: 'Аноним',
    approve: 'Одобрить',
    delete: 'Удалить',
    confirmDelete: 'Подтвердите удаление',
    total: 'Всего',
    avgRating: 'Средний рейтинг'
  },
  en: {
    title: 'Feedback',
    subtitle: 'Parent feedback',
    pending: 'Pending',
    approved: 'Approved',
    all: 'All',
    search: 'Search...',
    noFeedbacks: 'No feedback',
    anonymous: 'Anonymous',
    approve: 'Approve',
    delete: 'Delete',
    confirmDelete: 'Confirm delete?',
    total: 'Total',
    avgRating: 'Avg Rating'
  }
}

export default function FeedbackManagementPage() {
  const { language } = useLanguage()
  const toast = useToast()
  const txt = TEXTS[language] || TEXTS.uz
  
  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState([])
  const [pendingFeedbacks, setPendingFeedbacks] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [allRes, pendingRes] = await Promise.all([
        api.get('/feedback'),
        api.get('/feedback/pending')
      ])
      setFeedbacks(allRes.data?.data || allRes.data || [])
      setPendingFeedbacks(pendingRes.data?.data || pendingRes.data || [])
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

  const handleDelete = async (id) => {
    if (!window.confirm(txt.confirmDelete)) return
    try {
      await api.delete(`/feedback/${id}`)
      toast.success('O\'chirildi!')
      fetchData()
    } catch {
      toast.error('Xatolik')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  // Stats
  const total = feedbacks.length + pendingFeedbacks.length
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) 
    : '0'

  // Filter
  let list = activeTab === 'pending' ? pendingFeedbacks : 
             activeTab === 'approved' ? feedbacks : 
             [...pendingFeedbacks, ...feedbacks]
  
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(f => f.parentName?.toLowerCase().includes(q) || f.comment?.toLowerCase().includes(q))
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
            <span className="fbm-stat-value">{total}</span>
            <span className="fbm-stat-label">{txt.total}</span>
          </div>
          <div className="fbm-stat">
            <span className="fbm-stat-value">{avgRating}</span>
            <span className="fbm-stat-label">{txt.avgRating}</span>
          </div>
          <div className="fbm-stat">
            <span className="fbm-stat-value">{pendingFeedbacks.length}</span>
            <span className="fbm-stat-label">{txt.pending}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fbm-toolbar">
        <div className="fbm-tabs">
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
            {txt.pending} ({pendingFeedbacks.length})
          </button>
          <button className={activeTab === 'approved' ? 'active' : ''} onClick={() => setActiveTab('approved')}>
            {txt.approved} ({feedbacks.length})
          </button>
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
            {txt.all} ({total})
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
          <div className="fbm-empty">{txt.noFeedbacks}</div>
        ) : (
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
