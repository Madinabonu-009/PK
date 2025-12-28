import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { Input, TextArea, Button } from '../common'
import api from '../../services/api'
import contractTexts from '../../data/contract'
import './EnrollmentForm.css'

export const validateEnrollmentForm = (data, texts) => {
  const errors = {}

  if (!data.childName || data.childName.trim() === '') {
    errors.childName = texts.childNameRequired
  }

  if (!data.birthDate || data.birthDate.trim() === '') {
    errors.birthDate = texts.birthDateRequired
  } else {
    const birthDate = new Date(data.birthDate)
    const today = new Date()
    const minAge = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate())
    const maxAge = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())
    
    if (birthDate > maxAge) {
      errors.birthDate = texts.minAge
    } else if (birthDate < minAge) {
      errors.birthDate = texts.maxAge
    }
  }

  if (!data.parentName || data.parentName.trim() === '') {
    errors.parentName = texts.parentNameRequired
  }

  if (!data.parentPhone || data.parentPhone.trim() === '') {
    errors.parentPhone = texts.phoneRequired
  } else {
    const phoneRegex = /^\+998[0-9]{9}$/
    if (!phoneRegex.test(data.parentPhone.trim())) {
      errors.parentPhone = texts.phoneFormat
    }
  }

  if (data.parentEmail && data.parentEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.parentEmail.trim())) {
      errors.parentEmail = texts.emailInvalid
    }
  }

  // Shartnoma roziligi tekshiruvi
  if (!data.contractAccepted) {
    errors.contractAccepted = texts.contractRequired
  }

  return errors
}

const initialFormState = {
  childName: '',
  birthDate: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  notes: '',
  contractAccepted: false
}

const EnrollmentForm = ({ onSuccess }) => {
  const { language } = useLanguage()
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)

  const contract = contractTexts[language] || contractTexts.uz

  const texts = {
    uz: {
      childNameLabel: 'Bola ismi',
      childNamePlaceholder: 'Bola to\'liq ismi',
      birthDateLabel: 'Tug\'ilgan sana',
      parentNameLabel: 'Ota-ona ismi',
      parentNamePlaceholder: 'Ota yoki ona to\'liq ismi',
      phoneLabel: 'Telefon raqam',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      notesLabel: 'Qo\'shimcha ma\'lumot',
      notesPlaceholder: 'Allergiya, maxsus ehtiyojlar yoki boshqa muhim ma\'lumotlar',
      submitButton: 'Ariza yuborish',
      successTitle: 'Ariza muvaffaqiyatli yuborildi!',
      successText: 'Tez orada siz bilan bog\'lanamiz.',
      newApplication: 'Yangi ariza yuborish',
      childNameRequired: 'Bola ismi kiritilishi shart',
      birthDateRequired: 'Tug\'ilgan sana kiritilishi shart',
      minAge: 'Bola kamida 2 yoshda bo\'lishi kerak',
      maxAge: 'Bola 6 yoshdan katta bo\'lmasligi kerak',
      parentNameRequired: 'Ota-ona ismi kiritilishi shart',
      phoneRequired: 'Telefon raqam kiritilishi shart',
      phoneFormat: 'Telefon raqam formati: +998XXXXXXXXX',
      emailInvalid: 'Email formati noto\'g\'ri',
      submitError: 'Ariza yuborishda xatolik yuz berdi',
      contractRequired: 'Ro\'yxatdan o\'tish uchun shartnomaga rozilik berish majburiy'
    },
    ru: {
      childNameLabel: 'Имя ребенка',
      childNamePlaceholder: 'Полное имя ребенка',
      birthDateLabel: 'Дата рождения',
      parentNameLabel: 'Имя родителя',
      parentNamePlaceholder: 'Полное имя отца или матери',
      phoneLabel: 'Номер телефона',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      notesLabel: 'Дополнительная информация',
      notesPlaceholder: 'Аллергии, особые потребности или другая важная информация',
      submitButton: 'Отправить заявку',
      successTitle: 'Заявка успешно отправлена!',
      successText: 'Мы свяжемся с вами в ближайшее время.',
      newApplication: 'Отправить новую заявку',
      childNameRequired: 'Имя ребенка обязательно',
      birthDateRequired: 'Дата рождения обязательна',
      minAge: 'Ребенку должно быть минимум 2 года',
      maxAge: 'Ребенку должно быть не более 6 лет',
      parentNameRequired: 'Имя родителя обязательно',
      phoneRequired: 'Номер телефона обязателен',
      phoneFormat: 'Формат телефона: +998XXXXXXXXX',
      emailInvalid: 'Неверный формат email',
      submitError: 'Ошибка отправки заявки',
      contractRequired: 'Для регистрации необходимо согласие с договором'
    },
    en: {
      childNameLabel: 'Child Name',
      childNamePlaceholder: 'Child\'s full name',
      birthDateLabel: 'Birth Date',
      parentNameLabel: 'Parent Name',
      parentNamePlaceholder: 'Father or mother\'s full name',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      notesLabel: 'Additional Information',
      notesPlaceholder: 'Allergies, special needs or other important information',
      submitButton: 'Submit Application',
      successTitle: 'Application submitted successfully!',
      successText: 'We will contact you soon.',
      newApplication: 'Submit new application',
      childNameRequired: 'Child name is required',
      birthDateRequired: 'Birth date is required',
      minAge: 'Child must be at least 2 years old',
      maxAge: 'Child must not be older than 6 years',
      parentNameRequired: 'Parent name is required',
      phoneRequired: 'Phone number is required',
      phoneFormat: 'Phone format: +998XXXXXXXXX',
      emailInvalid: 'Invalid email format',
      submitError: 'Error submitting application',
      contractRequired: 'Agreement to the contract is required for registration'
    }
  }

  const txt = texts[language]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: newValue }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setSubmitError('')
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const fieldErrors = validateEnrollmentForm(formData, txt)
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    const validationErrors = validateEnrollmentForm(formData, txt)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await api.post('/enrollments', formData)
      setSubmitSuccess(true)
      setFormData(initialFormState)
      setTouched({})
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (error) {
      const message = error.response?.data?.error || txt.submitError
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="enrollment-success">
        <div className="success-icon">✓</div>
        <h3>{txt.successTitle}</h3>
        <p>{txt.successText}</p>
        <Button onClick={() => setSubmitSuccess(false)}>
          {txt.newApplication}
        </Button>
      </div>
    )
  }

  return (
    <form className="enrollment-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <Input
          label={txt.childNameLabel}
          name="childName"
          value={formData.childName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.childNamePlaceholder}
          error={touched.childName ? errors.childName : ''}
          required
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.birthDateLabel}
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.birthDate ? errors.birthDate : ''}
          required
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.parentNameLabel}
          name="parentName"
          value={formData.parentName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.parentNamePlaceholder}
          error={touched.parentName ? errors.parentName : ''}
          required
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.phoneLabel}
          name="parentPhone"
          type="tel"
          value={formData.parentPhone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.phonePlaceholder}
          error={touched.parentPhone ? errors.parentPhone : ''}
          required
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.emailLabel}
          name="parentEmail"
          type="email"
          value={formData.parentEmail}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.emailPlaceholder}
          error={touched.parentEmail ? errors.parentEmail : ''}
        />
      </div>

      <div className="form-row">
        <TextArea
          label={txt.notesLabel}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.notesPlaceholder}
          rows={4}
        />
      </div>

      {submitError && (
        <div className="form-error-message">
          {submitError}
        </div>
      )}

      {/* Shartnoma roziligi */}
      <div className="contract-section">
        <div className={`contract-checkbox-wrapper ${errors.contractAccepted && touched.contractAccepted ? 'has-error' : ''}`}>
          <label className="contract-checkbox-label">
            <input
              type="checkbox"
              name="contractAccepted"
              checked={formData.contractAccepted}
              onChange={handleChange}
              onBlur={handleBlur}
              className="contract-checkbox"
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">
              {contract.acceptLabel}
            </span>
          </label>
          <button
            type="button"
            className="view-contract-link"
            onClick={() => setIsContractModalOpen(true)}
          >
            📄 {contract.viewContract}
          </button>
        </div>
        {errors.contractAccepted && touched.contractAccepted && (
          <div className="contract-error">
            {errors.contractAccepted}
          </div>
        )}
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {txt.submitButton}
        </Button>
      </div>

      {/* Shartnoma Modal */}
      <AnimatePresence>
        {isContractModalOpen && (
          <motion.div
            className="contract-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsContractModalOpen(false)}
          >
            <motion.div
              className="contract-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="contract-modal-header">
                <h2>{contract.title}</h2>
                <button
                  type="button"
                  className="contract-modal-close"
                  onClick={() => setIsContractModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="contract-modal-body">
                {contract.sections.map((section, index) => (
                  <div key={index} className="contract-section-item">
                    <h3>{section.title}</h3>
                    <p>{section.content}</p>
                  </div>
                ))}
                <div className="contract-agreement">
                  <p>{contract.agreement}</p>
                </div>
              </div>
              <div className="contract-modal-footer">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, contractAccepted: true }))
                    setErrors(prev => ({ ...prev, contractAccepted: '' }))
                    setIsContractModalOpen(false)
                  }}
                >
                  ✓ {contract.acceptLabel}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsContractModalOpen(false)}
                >
                  {contract.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

export default EnrollmentForm
