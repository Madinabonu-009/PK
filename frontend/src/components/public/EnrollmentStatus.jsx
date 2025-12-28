import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Input, Button, Card } from '../common'
import api from '../../services/api'
import './EnrollmentStatus.css'

const EnrollmentStatus = () => {
  const { language } = useLanguage()
  const [searchPhone, setSearchPhone] = useState('')
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [enrollments, setEnrollments] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const texts = {
    uz: {
      title: 'Ariza holatini tekshirish',
      subtitle: 'Telefon raqamingizni kiriting',
      placeholder: '+998901234567',
      checkButton: 'Tekshirish',
      phoneRequired: 'Telefon raqam kiriting',
      phoneFormat: 'Telefon raqam formati: +998XXXXXXXXX',
      searchError: 'Qidirishda xatolik yuz berdi',
      notFound: 'Bu telefon raqam bilan ariza topilmadi',
      pending: 'Ko\'rib chiqilmoqda',
      pendingDesc: 'Arizangiz ko\'rib chiqilmoqda. Tez orada javob beramiz.',
      accepted: 'Qabul qilindi',
      acceptedDesc: 'Tabriklaymiz! Arizangiz qabul qilindi. Biz siz bilan bog\'lanamiz.',
      rejected: 'Rad etildi',
      rejectedDesc: 'Afsuski, arizangiz rad etildi.',
      unknown: 'Noma\'lum',
      reason: 'Sabab'
    },
    ru: {
      title: 'Проверить статус заявки',
      subtitle: 'Введите ваш номер телефона',
      placeholder: '+998901234567',
      checkButton: 'Проверить',
      phoneRequired: 'Введите номер телефона',
      phoneFormat: 'Формат телефона: +998XXXXXXXXX',
      searchError: 'Ошибка поиска',
      notFound: 'Заявка с этим номером телефона не найдена',
      pending: 'На рассмотрении',
      pendingDesc: 'Ваша заявка рассматривается. Скоро ответим.',
      accepted: 'Принято',
      acceptedDesc: 'Поздравляем! Ваша заявка принята. Мы свяжемся с вами.',
      rejected: 'Отклонено',
      rejectedDesc: 'К сожалению, ваша заявка отклонена.',
      unknown: 'Неизвестно',
      reason: 'Причина'
    },
    en: {
      title: 'Check Application Status',
      subtitle: 'Enter your phone number',
      placeholder: '+998901234567',
      checkButton: 'Check',
      phoneRequired: 'Enter phone number',
      phoneFormat: 'Phone format: +998XXXXXXXXX',
      searchError: 'Search error',
      notFound: 'No application found with this phone number',
      pending: 'Under Review',
      pendingDesc: 'Your application is being reviewed. We will respond soon.',
      accepted: 'Accepted',
      acceptedDesc: 'Congratulations! Your application has been accepted. We will contact you.',
      rejected: 'Rejected',
      rejectedDesc: 'Unfortunately, your application has been rejected.',
      unknown: 'Unknown',
      reason: 'Reason'
    }
  }

  const txt = texts[language]

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchPhone.trim()) {
      setSearchError(txt.phoneRequired)
      return
    }

    const phoneRegex = /^\+998[0-9]{9}$/
    if (!phoneRegex.test(searchPhone.trim())) {
      setSearchError(txt.phoneFormat)
      return
    }

    setIsSearching(true)
    setSearchError('')
    setNotFound(false)

    try {
      const response = await api.get(`/enrollments/status/${encodeURIComponent(searchPhone.trim())}`)
      if (response.data && response.data.length > 0) {
        setEnrollments(response.data)
      } else {
        setNotFound(true)
        setEnrollments(null)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true)
        setEnrollments(null)
      } else {
        setSearchError(txt.searchError)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: txt.pending,
          className: 'status-pending',
          icon: '⏳',
          description: txt.pendingDesc
        }
      case 'accepted':
        return {
          label: txt.accepted,
          className: 'status-accepted',
          icon: '✓',
          description: txt.acceptedDesc
        }
      case 'rejected':
        return {
          label: txt.rejected,
          className: 'status-rejected',
          icon: '✗',
          description: txt.rejectedDesc
        }
      default:
        return {
          label: txt.unknown,
          className: 'status-unknown',
          icon: '?',
          description: ''
        }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )
  }

  return (
    <div className="enrollment-status">
      <Card>
        <Card.Header>
          <h3>{txt.title}</h3>
          <p>{txt.subtitle}</p>
        </Card.Header>
        <Card.Body>
          <form className="status-search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <Input
                name="phone"
                type="tel"
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value)
                  setSearchError('')
                }}
                placeholder={txt.placeholder}
                error={searchError}
              />
              <Button
                type="submit"
                variant="primary"
                loading={isSearching}
                disabled={isSearching}
              >
                {txt.checkButton}
              </Button>
            </div>
          </form>

          {notFound && (
            <div className="status-not-found">
              <span className="not-found-icon">🔍</span>
              <p>{txt.notFound}</p>
            </div>
          )}

          {enrollments && enrollments.length > 0 && (
            <div className="status-results">
              {enrollments.map((enrollment) => {
                const statusInfo = getStatusInfo(enrollment.status)
                return (
                  <div key={enrollment.id} className={`status-card ${statusInfo.className}`}>
                    <div className="status-header">
                      <div className="status-badge">
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span className="status-label">{statusInfo.label}</span>
                      </div>
                      <span className="status-date">
                        {formatDate(enrollment.submittedAt)}
                      </span>
                    </div>
                    <div className="status-body">
                      <h4>{enrollment.childName}</h4>
                      <p className="status-description">{statusInfo.description}</p>
                      {enrollment.status === 'rejected' && enrollment.rejectionReason && (
                        <p className="rejection-reason">
                          <strong>{txt.reason}:</strong> {enrollment.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default EnrollmentStatus
