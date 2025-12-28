import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Button, Card, Loading } from '../../components/common'
import api from '../../services/api'
import './FeedbackManagementPage.css'

function FeedbackManagementPage() {
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [pendingFeedbacks, setPendingFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [error, setError] = useState(null)

  const texts = {
    uz: {
      pageTitle: 'Fikrlar boshqaruvi',
      pending: 'Kutilmoqda',
      approved: 'Tasdiqlangan',
      loading: 'Yuklanmoqda...',
      noPending: 'Kutilayotgan fikrlar yo\'q',
      noFeedbacks: 'Fikrlar yo\'q',
      anonymous: 'Anonim',
      teacher: 'O\'qituvchi',
      approve: '✓ Tasdiqlash',
      delete: '🗑️ O\'chirish',
      confirmDelete: 'Bu fikrni o\'chirishni xohlaysizmi?'
    },
    ru: {
      pageTitle: 'Управление отзывами',
      pending: 'Ожидает',
      approved: 'Одобрено',
      loading: 'Загрузка...',
      noPending: 'Нет ожидающих отзывов',
      noFeedbacks: 'Нет отзывов',
      anonymous: 'Аноним',
      teacher: 'Воспитатель',
      approve: '✓ Одобрить',
      delete: '🗑️ Удалить',
      confirmDelete: 'Вы хотите удалить этот отзыв?'
    },
    en: {
      pageTitle: 'Feedback Management',
      pending: 'Pending',
      approved: 'Approved',
      loading: 'Loading...',
      noPending: 'No pending feedbacks',
      noFeedbacks: 'No feedbacks',
      anonymous: 'Anonymous',
      teacher: 'Teacher',
      approve: '✓ Approve',
      delete: '🗑️ Delete',
      confirmDelete: 'Do you want to delete this feedback?'
    }
  }

  const txt = texts[language]

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allRes, pendingRes] = await Promise.all([
        api.get('/feedback'),
        api.get('/feedback/pending')
      ])
      
      const allData = allRes.data?.data || (Array.isArray(allRes.data) ? allRes.data : [])
      const pendingData = pendingRes.data?.data || (Array.isArray(pendingRes.data) ? pendingRes.data : [])
      
      setFeedbacks(allData)
      setPendingFeedbacks(pendingData)
    } catch (err) {
      setError(t('errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  const approveFeedback = async (id) => {
    try {
      await api.put(`/feedback/${id}/approve`)
      fetchFeedbacks()
    } catch (err) {
      setError(t('errorOccurred'))
    }
  }

  const deleteFeedback = async (id) => {
    if (!window.confirm(txt.confirmDelete)) return
    
    try {
      await api.delete(`/feedback/${id}`)
      fetchFeedbacks()
    } catch (err) {
      setError(t('errorOccurred'))
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentFeedbacks = activeTab === 'pending' ? pendingFeedbacks : feedbacks

  if (loading) {
    return (
      <div className="feedback-management">
        <Loading text={t('loading')} />
      </div>
    )
  }

  return (
    <div className="feedback-management">
      <div className="feedback-header">
        <div className="header-left">
          <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
            ← {t('back')}
          </Button>
          <h1>{txt.pageTitle}</h1>
        </div>
        <div className="header-right">
          <span>{t('welcome')}, {user?.username}</span>
          <Button variant="secondary" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="feedback-error">
          <p>{error}</p>
          <Button variant="secondary" onClick={() => setError(null)}>
            {t('close')}
          </Button>
        </div>
      )}

      <div className="page-header">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            {txt.pending} ({pendingFeedbacks.length})
          </button>
          <button 
            className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            {txt.approved} ({feedbacks.length})
          </button>
        </div>
      </div>

      {currentFeedbacks.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'pending' ? txt.noPending : txt.noFeedbacks}
        </div>
      ) : (
        <div className="feedbacks-list">
          {currentFeedbacks.map(feedback => (
            <div key={feedback.id} className="feedback-item">
              <div className="feedback-content">
                <div className="feedback-meta">
                  <span className="author">{feedback.parentName || txt.anonymous}</span>
                  <span className="rating">{renderStars(feedback.rating)}</span>
                  <span className="date">{formatDate(feedback.createdAt)}</span>
                </div>
                <p className="comment">{feedback.comment}</p>
                {feedback.targetName && (
                  <span className="target">{txt.teacher}: {feedback.targetName}</span>
                )}
              </div>
              <div className="feedback-actions">
                {activeTab === 'pending' && (
                  <button 
                    className="btn-approve"
                    onClick={() => approveFeedback(feedback.id)}
                  >
                    {txt.approve}
                  </button>
                )}
                <button 
                  className="btn-delete"
                  onClick={() => deleteFeedback(feedback.id)}
                >
                  {txt.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FeedbackManagementPage
