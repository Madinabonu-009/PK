import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { Input, TextArea, Button } from '../common'
import api from '../../services/api'
import './ContactForm.css'

export const validateContactForm = (data, texts) => {
  const errors = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = texts.nameRequired
  }

  if (data.phone && data.phone.trim() !== '') {
    const phoneRegex = /^\+998[0-9]{9}$/
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = texts.phoneFormat
    }
  }

  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = texts.emailInvalid
    }
  }

  if (!data.message || data.message.trim() === '') {
    errors.message = texts.messageRequired
  }

  return errors
}

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  message: ''
}

const ContactForm = ({ onSuccess }) => {
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const texts = {
    uz: {
      nameLabel: 'Ismingiz',
      namePlaceholder: 'To\'liq ismingiz',
      phoneLabel: 'Telefon raqam',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      messageLabel: 'Xabaringiz',
      messagePlaceholder: 'Savolingiz yoki xabaringizni yozing...',
      submitButton: 'Xabar yuborish',
      successTitle: 'Xabaringiz muvaffaqiyatli yuborildi!',
      successText: 'Tez orada siz bilan bog\'lanamiz.',
      newMessage: 'Yangi xabar yuborish',
      nameRequired: 'Ism kiritilishi shart',
      phoneFormat: 'Telefon raqam formati: +998XXXXXXXXX',
      emailInvalid: 'Email formati noto\'g\'ri',
      messageRequired: 'Xabar kiritilishi shart',
      submitError: 'Xabar yuborishda xatolik yuz berdi'
    },
    ru: {
      nameLabel: 'Ваше имя',
      namePlaceholder: 'Полное имя',
      phoneLabel: 'Номер телефона',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      messageLabel: 'Ваше сообщение',
      messagePlaceholder: 'Напишите ваш вопрос или сообщение...',
      submitButton: 'Отправить сообщение',
      successTitle: 'Ваше сообщение успешно отправлено!',
      successText: 'Мы свяжемся с вами в ближайшее время.',
      newMessage: 'Отправить новое сообщение',
      nameRequired: 'Имя обязательно',
      phoneFormat: 'Формат телефона: +998XXXXXXXXX',
      emailInvalid: 'Неверный формат email',
      messageRequired: 'Сообщение обязательно',
      submitError: 'Ошибка отправки сообщения'
    },
    en: {
      nameLabel: 'Your Name',
      namePlaceholder: 'Full name',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+998901234567',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      messageLabel: 'Your Message',
      messagePlaceholder: 'Write your question or message...',
      submitButton: 'Send Message',
      successTitle: 'Your message was sent successfully!',
      successText: 'We will contact you soon.',
      newMessage: 'Send new message',
      nameRequired: 'Name is required',
      phoneFormat: 'Phone format: +998XXXXXXXXX',
      emailInvalid: 'Invalid email format',
      messageRequired: 'Message is required',
      submitError: 'Error sending message'
    }
  }

  const txt = texts[language]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setSubmitError('')
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const fieldErrors = validateContactForm(formData, txt)
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

    const validationErrors = validateContactForm(formData, txt)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await api.post('/contact', formData)
      setSubmitSuccess(true)
      setFormData(initialFormState)
      setTouched({})
      if (onSuccess) {
        onSuccess()
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
      <div className="contact-success">
        <div className="success-icon">✓</div>
        <h3>{txt.successTitle}</h3>
        <p>{txt.successText}</p>
        <Button onClick={() => setSubmitSuccess(false)}>
          {txt.newMessage}
        </Button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <Input
          label={txt.nameLabel}
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.namePlaceholder}
          error={touched.name ? errors.name : ''}
          required
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.phoneLabel}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.phonePlaceholder}
          error={touched.phone ? errors.phone : ''}
        />
      </div>

      <div className="form-row">
        <Input
          label={txt.emailLabel}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.emailPlaceholder}
          error={touched.email ? errors.email : ''}
        />
      </div>

      <div className="form-row">
        <TextArea
          label={txt.messageLabel}
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={txt.messagePlaceholder}
          rows={5}
          error={touched.message ? errors.message : ''}
          required
        />
      </div>

      {submitError && (
        <div className="form-error-message">
          {submitError}
        </div>
      )}

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
    </form>
  )
}

export default ContactForm
