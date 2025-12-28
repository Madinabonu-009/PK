import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Loading } from '../../components/common'
import api from '../../services/api'
import './MyChildPage.css'

const MyChildPage = () => {
  const { language } = useLanguage()
  const [phone, setPhone] = useState('')
  const [enrollments, setEnrollments] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const texts = {
    uz: {
      title: 'Ariza holatini tekshirish',
      subtitle: 'Telefon raqamingizni kiriting',
      phone: 'Telefon raqam',
      phonePlaceholder: '+998901234567',
      check: 'Tekshirish',
      status: 'Holat',
      child: 'Bola',
      date: 'Sana',
      pending: 'Ko\'rib chiqilmoqda',
      accepted: 'Qabul qilindi',
      rejected: 'Rad etildi',
      notFound: 'Ariza topilmadi',
      error: 'Xatolik yuz berdi'
    },
    ru: {
      title: 'Проверить статус заявки',
      subtitle: 'Введите ваш номер телефона',
      phone: 'Номер телефона',
      phonePlaceholder: '+998901234567',
      check: 'Проверить',
      status: 'Статус',
      child: 'Ребенок',
      date: 'Дата',
      pending: 'На рассмотрении',
      accepted: 'Принято',
      rejected: 'Отклонено',
      notFound: 'Заявка не найдена',
      error: 'Произошла ошибка'
    },
    en: {
      title: 'Check Application Status',
      subtitle: 'Enter your phone number',
      phone: 'Phone number',
      phonePlaceholder: '+998901234567',
      check: 'Check',
      status: 'Status',
      child: 'Child',
      date: 'Date',
      pending: 'Under review',
      accepted: 'Accepted',
      rejected: 'Rejected',
      notFound: 'Application not found',
      error: 'An error occurred'
    }
  }

  const txt = texts[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    setError(null)
    setEnrollments(null)

    try {
      const response = await api.get(`/enrollments/status/${encodeURIComponent(phone)}`)
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : response.data)
      setEnrollments(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(txt.notFound)
      } else {
        setError(txt.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = { pending: txt.pending, accepted: txt.accepted, rejected: txt.rejected }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = { pending: 'status-pending', accepted: 'status-accepted', rejected: 'status-rejected' }
    return classMap[status] || ''
  }

  return (
    <div className="my-child-page">
      <div className="my-child-container">
        <h1>{txt.title}</h1>
        <p className="subtitle">{txt.subtitle}</p>

        <form onSubmit={handleSubmit} className="check-form">
          <div className="form-group">
            <label>{txt.phone}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={txt.phonePlaceholder}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? '...' : txt.check}
          </button>
        </form>

        {loading && <Loading />}

        {error && <div className="error-message">{error}</div>}

        {enrollments && enrollments.length > 0 && (
          <div className="enrollments-list">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="enrollment-card">
                <div className="enrollment-info">
                  <span className="child-name">{enrollment.childName}</span>
                  <span className="enrollment-date">
                    {new Date(enrollment.submittedAt || enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`enrollment-status ${getStatusClass(enrollment.status)}`}>
                  {getStatusText(enrollment.status)}
                </span>
                {enrollment.rejectionReason && (
                  <p className="rejection-reason">{enrollment.rejectionReason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyChildPage
