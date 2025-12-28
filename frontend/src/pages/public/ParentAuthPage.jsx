// Ota-onalar autentifikatsiya sahifasi
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './ParentAuthPage.css'

const ParentAuthPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    childCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const texts = {
    uz: {
      title: "Ota-onalar portali",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      phone: "Telefon raqam",
      password: "Parol",
      name: "Ismingiz",
      childCode: "Bola kodi",
      childCodeHint: "Bog'cha tomonidan berilgan kod",
      submit: "Yuborish",
      noAccount: "Hisobingiz yo'qmi?",
      hasAccount: "Hisobingiz bormi?",
      forgotPassword: "Parolni unutdingizmi?",
      welcome: "Xush kelibsiz!",
      subtitle: "Bolangiz haqida barcha ma'lumotlarni kuzating"
    },
    ru: {
      title: "Портал родителей",
      login: "Вход",
      register: "Регистрация",
      phone: "Номер телефона",
      password: "Пароль",
      name: "Ваше имя",
      childCode: "Код ребёнка",
      childCodeHint: "Код, выданный детским садом",
      submit: "Отправить",
      noAccount: "Нет аккаунта?",
      hasAccount: "Есть аккаунт?",
      forgotPassword: "Забыли пароль?",
      welcome: "Добро пожаловать!",
      subtitle: "Следите за всей информацией о вашем ребёнке"
    },
    en: {
      title: "Parent Portal",
      login: "Login",
      register: "Register",
      phone: "Phone number",
      password: "Password",
      name: "Your name",
      childCode: "Child code",
      childCodeHint: "Code provided by kindergarten",
      submit: "Submit",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      forgotPassword: "Forgot password?",
      welcome: "Welcome!",
      subtitle: "Track all information about your child"
    }
  }

  const txt = texts[language] || texts.uz

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store parent info
      localStorage.setItem('parentAuth', JSON.stringify({
        phone: formData.phone,
        name: formData.name || 'Ota-ona',
        isAuthenticated: true
      }))
      
      navigate('/parent-dashboard')
    } catch (err) {
      setError('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="parent-auth-page">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <span className="auth-icon">👨‍👩‍👧</span>
          <h1>{txt.title}</h1>
          <p>{txt.subtitle}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            {txt.login}
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            {txt.register}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>{txt.name}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={txt.name}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label>{txt.phone}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>

          <div className="form-group">
            <label>{txt.password}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>{txt.childCode}</label>
              <input
                type="text"
                value={formData.childCode}
                onChange={(e) => setFormData({...formData, childCode: e.target.value})}
                placeholder="PK-12345"
              />
              <small>{txt.childCodeHint}</small>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '...' : txt.submit}
          </button>

          {isLogin && (
            <a href="#" className="forgot-link">{txt.forgotPassword}</a>
          )}
        </form>

        <div className="auth-switch">
          {isLogin ? txt.noAccount : txt.hasAccount}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? txt.register : txt.login}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ParentAuthPage
