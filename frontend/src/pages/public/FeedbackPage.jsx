import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './FeedbackPage.css'

function FeedbackPage() {
  const { t, language } = useLanguage()
  
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    parentName: '',
    parentEmail: '',
    rating: 5,
    comment: ''
  })

  const texts = {
    uz: {
      leaveReview: 'Fikr qoldirish',
      yourName: 'Ismingiz',
      yourEmail: 'Email (ixtiyoriy)',
      rating: 'Baho',
      comment: 'Fikringiz',
      submit: 'Yuborish',
      success: 'Fikringiz qabul qilindi! Admin tasdiqlashidan keyin ko\'rinadi.',
      anonymous: 'Anonim',
      noReviews: 'Hozircha fikrlar yo\'q'
    },
    ru: {
      leaveReview: 'Оставить отзыв',
      yourName: 'Ваше имя',
      yourEmail: 'Email (необязательно)',
      rating: 'Оценка',
      comment: 'Ваш отзыв',
      submit: 'Отправить',
      success: 'Ваш отзыв принят! Он появится после одобрения администратором.',
      anonymous: 'Аноним',
      noReviews: 'Пока нет отзывов'
    },
    en: {
      leaveReview: 'Leave a Review',
      yourName: 'Your Name',
      yourEmail: 'Email (optional)',
      rating: 'Rating',
      comment: 'Your Review',
      submit: 'Submit',
      success: 'Your review has been submitted! It will appear after admin approval.',
      anonymous: 'Anonymous',
      noReviews: 'No reviews yet'
    }
  }

  const txt = texts[language]

  useEffect(() => {
    fetchFeedbacks()
    fetchStats()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/feedback')
      setFeedbacks(response.data)
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/feedback/stats')
      setStats(response.data)
    } catch (error) {
      // Error handled silently
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/feedback', form)
      
      if (response.status === 201) {
        setSubmitted(true)
        setForm({ parentName: '', parentEmail: '', rating: 5, comment: '' })
        setTimeout(() => {
          setShowForm(false)
          setSubmitted(false)
        }, 3000)
      }
    } catch (error) {
      // Error handled by UI state
    }
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )
  }

  return (
    <div className="feedback-page">
      <section className="feedback-hero">
        <div className="container">
          <h1>{t('feedbackTitle')}</h1>
          <p>{t('feedbackSubtitle')}</p>
        </div>
      </section>

      <section className="feedback-stats">
        <div className="container">
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-value">{stats.averageRating}</span>
              <span className="stat-stars">{renderStars(Math.round(stats.averageRating))}</span>
              <span className="stat-label">{t('averageRating')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalRatings}</span>
              <span className="stat-label">{t('totalReviews')}</span>
            </div>
          </div>
          
          <button 
            className="leave-review-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {txt.leaveReview}
          </button>
        </div>
      </section>

      {showForm && (
        <section className="feedback-form-section">
          <div className="container">
            {submitted ? (
              <div className="success-message">{txt.success}</div>
            ) : (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>{txt.yourName}</label>
                  <input
                    type="text"
                    value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})}
                    placeholder={txt.anonymous}
                  />
                </div>
                
                <div className="form-group">
                  <label>{txt.yourEmail}</label>
                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={e => setForm({...form, parentEmail: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>{txt.rating}</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${form.rating >= star ? 'active' : ''}`}
                        onClick={() => setForm({...form, rating: star})}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{txt.comment}</label>
                  <textarea
                    value={form.comment}
                    onChange={e => setForm({...form, comment: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                
                <button type="submit" className="submit-btn">{txt.submit}</button>
              </form>
            )}
          </div>
        </section>
      )}

      <section className="feedback-list">
        <div className="container">
          {loading ? (
            <div className="loading">{t('loading')}</div>
          ) : feedbacks.length === 0 ? (
            <div className="no-feedbacks">{txt.noReviews}</div>
          ) : (
            <div className="feedbacks-grid">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="feedback-card">
                  <div className="feedback-header">
                    <span className="feedback-author">{feedback.parentName || txt.anonymous}</span>
                    <span className="feedback-rating">{renderStars(feedback.rating)}</span>
                  </div>
                  <p className="feedback-comment">{feedback.comment}</p>
                  <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default FeedbackPage
