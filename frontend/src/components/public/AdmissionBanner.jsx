/**
 * Admission Banner Component (Enhanced)
 * "Ro'yxatga olish ochiq" banner with countdown and confetti
 */
import { memo, useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './AdmissionBanner.css'

const TEXTS = {
  uz: {
    title: "2026-2027 o'quv yili uchun ro'yxatga olish ochiq!",
    subtitle: "Farzandingiz kelajagi uchun birinchi qadamni qo'ying. Bizning bog'chamizda bolangiz xavfsiz, qiziqarli va rivojlantiruvchi muhitda o'sadi.",
    cta: "Hoziroq ro'yxatdan o'ting",
    spots: "Cheklangan joylar",
    hurry: "Shoshiling!",
    countdown: {
      days: "kun",
      hours: "soat", 
      mins: "daqiqa",
      secs: "soniya",
      until: "Ro'yxatga olish tugashiga"
    },
    features: ["Rus tili guruhlari", "Ingliz tili guruhlari", "Qabul davom etmoqda"]
  },
  ru: {
    title: "Набор на 2026-2027 учебный год открыт!",
    subtitle: "Сделайте первый шаг к будущему вашего ребенка. В нашем детском саду ваш ребенок будет расти в безопасной, интересной и развивающей среде.",
    cta: "Записаться сейчас",
    spots: "Ограниченные места",
    hurry: "Торопитесь!",
    countdown: {
      days: "дней",
      hours: "часов",
      mins: "минут", 
      secs: "секунд",
      until: "До окончания набора"
    },
    features: ["Группы русского языка", "Группы английского языка", "Набор продолжается"]
  },
  en: {
    title: "Admission Open for 2026-2027!",
    subtitle: "Take the first step towards your child's future. In our kindergarten, your child will grow in a safe, exciting and developmental environment.",
    cta: "Enroll Now",
    spots: "Limited Spots",
    hurry: "Hurry!",
    countdown: {
      days: "days",
      hours: "hours",
      mins: "mins",
      secs: "secs",
      until: "Until enrollment ends"
    },
    features: ["Russian Language Groups", "English Language Groups", "Admission Open"]
  }
}

// Countdown hook
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [targetDate])
  
  return timeLeft
}

// Countdown display component
const CountdownTimer = memo(function CountdownTimer({ timeLeft, labels }) {
  return (
    <div className="countdown-timer">
      <div className="countdown-item">
        <span className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="countdown-label">{labels.days}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">{labels.hours}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-number">{String(timeLeft.mins).padStart(2, '0')}</span>
        <span className="countdown-label">{labels.mins}</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-number">{String(timeLeft.secs).padStart(2, '0')}</span>
        <span className="countdown-label">{labels.secs}</span>
      </div>
    </div>
  )
})

const AdmissionBanner = memo(function AdmissionBanner({ variant = 'floating' }) {
  const { language } = useLanguage()
  const txt = TEXTS[language]
  const [isVisible, setIsVisible] = useState(true)
  
  // Set target date to 30 days from now
  const targetDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.getTime()
  }, [])
  
  const timeLeft = useCountdown(targetDate)

  if (variant === 'floating') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="admission-banner admission-banner--floating"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="admission-banner__content">
              <div className="admission-banner__pulse" />
              <motion.span 
                className="admission-banner__badge"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉 {txt.spots}
              </motion.span>
              <span className="admission-banner__text">{txt.title}</span>
              <Link to="/enrollment" className="admission-banner__cta">
                {txt.cta} →
              </Link>
            </div>
            <button 
              className="admission-banner__close"
              onClick={() => setIsVisible(false)}
              aria-label="Yopish"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <section className="admission-banner admission-banner--section">
      <div className="admission-banner__bg">
        <div className="admission-banner__shapes">
          <span className="shape shape--1">⭐</span>
          <span className="shape shape--2">🎈</span>
          <span className="shape shape--3">🌟</span>
          <span className="shape shape--4">🎀</span>
          <span className="shape shape--5">✨</span>
          <span className="shape shape--6">🎊</span>
          <span className="shape shape--7">🌈</span>
          <span className="shape shape--8">💫</span>
        </div>
      </div>
      <div className="admission-banner__container">
        <motion.div 
          className="admission-banner__info"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="admission-banner__label"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="pulse-dot" /> {txt.hurry}
          </motion.span>
          <h2 className="admission-banner__title">{txt.title}</h2>
          <p className="admission-banner__subtitle">{txt.subtitle}</p>
          
          {/* Features list */}
          <div className="admission-banner__features">
            {txt.features.map((feature, idx) => (
              <motion.span 
                key={idx}
                className="feature-tag"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                ✓ {feature}
              </motion.span>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          className="admission-banner__action"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Countdown */}
          <div className="countdown-wrapper">
            <span className="countdown-title">{txt.countdown.until}</span>
            <CountdownTimer timeLeft={timeLeft} labels={txt.countdown} />
          </div>
          
          <Link to="/enrollment" className="admission-banner__button">
            <span>{txt.cta}</span>
            <motion.span 
              className="btn-arrow"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
})

export default AdmissionBanner
