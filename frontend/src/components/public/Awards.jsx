/**
 * Awards & Achievements Component (Enhanced)
 * Bog'chamiz yutuqlari va mukofotlari - animated counters
 */
import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './Awards.css'

const AWARDS_DATA = {
  uz: {
    title: "Yutuqlar va mukofotlar",
    subtitle: "Bizning muvaffaqiyatlarimiz - sizning ishonchingiz",
    stats: [
      { number: 100, suffix: "+", label: "Baxtli bolalar", icon: "👶" },
      { number: 5, suffix: "+", label: "Yillik tajriba", icon: "📅" },
      { number: 10, suffix: "+", label: "Malakali o'qituvchilar", icon: "👩‍🏫" },
      { number: 98, suffix: "%", label: "Ota-onalar mamnuniyati", icon: "❤️" }
    ],
    awards: [
      {
        icon: "🏆",
        title: "Eng yaxshi bog'cha",
        year: "2024",
        desc: "Shahar miqyosida eng yaxshi ta'lim muassasasi"
      },
      {
        icon: "⭐",
        title: "Sifat sertifikati",
        year: "2023",
        desc: "ISO 9001 xalqaro sifat standartiga muvofiqlik"
      },
      {
        icon: "🎖️",
        title: "Innovatsion ta'lim",
        year: "2023",
        desc: "Zamonaviy o'qitish usullari uchun mukofot"
      },
      {
        icon: "💚",
        title: "Eko-bog'cha",
        year: "2022",
        desc: "Ekologik toza muhit yaratish bo'yicha sertifikat"
      }
    ]
  },
  ru: {
    title: "Награды и достижения",
    subtitle: "Наши успехи - ваше доверие",
    stats: [
      { number: 100, suffix: "+", label: "Счастливых детей", icon: "👶" },
      { number: 5, suffix: "+", label: "Лет опыта", icon: "📅" },
      { number: 10, suffix: "+", label: "Квалифицированных педагогов", icon: "👩‍🏫" },
      { number: 98, suffix: "%", label: "Довольных родителей", icon: "❤️" }
    ],
    awards: [
      {
        icon: "🏆",
        title: "Лучший детский сад",
        year: "2024",
        desc: "Лучшее образовательное учреждение города"
      },
      {
        icon: "⭐",
        title: "Сертификат качества",
        year: "2023",
        desc: "Соответствие международному стандарту ISO 9001"
      },
      {
        icon: "🎖️",
        title: "Инновационное образование",
        year: "2023",
        desc: "Награда за современные методы обучения"
      },
      {
        icon: "💚",
        title: "Эко-детский сад",
        year: "2022",
        desc: "Сертификат за экологически чистую среду"
      }
    ]
  },
  en: {
    title: "Awards & Achievements",
    subtitle: "Our success is your trust",
    stats: [
      { number: 100, suffix: "+", label: "Happy Children", icon: "👶" },
      { number: 5, suffix: "+", label: "Years of Experience", icon: "📅" },
      { number: 10, suffix: "+", label: "Qualified Teachers", icon: "👩‍🏫" },
      { number: 98, suffix: "%", label: "Parent Satisfaction", icon: "❤️" }
    ],
    awards: [
      {
        icon: "🏆",
        title: "Best Kindergarten",
        year: "2024",
        desc: "Best educational institution in the city"
      },
      {
        icon: "⭐",
        title: "Quality Certificate",
        year: "2023",
        desc: "ISO 9001 international quality standard compliance"
      },
      {
        icon: "🎖️",
        title: "Innovative Education",
        year: "2023",
        desc: "Award for modern teaching methods"
      },
      {
        icon: "💚",
        title: "Eco-Kindergarten",
        year: "2022",
        desc: "Certificate for eco-friendly environment"
      }
    ]
  }
}

// Animated counter hook
const useCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  useEffect(() => {
    if (startOnView && !isInView) return
    if (hasStarted) return
    
    setHasStarted(true)
    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView, startOnView, hasStarted])
  
  return { count, ref }
}

const StatCard = memo(function StatCard({ stat, index }) {
  const { count, ref } = useCounter(stat.number, 2000)
  
  return (
    <motion.div 
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      <motion.span 
        className="stat-card__icon"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
      >
        {stat.icon}
      </motion.span>
      <span className="stat-card__number">{count}{stat.suffix}</span>
      <span className="stat-card__label">{stat.label}</span>
    </motion.div>
  )
})

const AwardCard = memo(function AwardCard({ award, index }) {
  return (
    <motion.div 
      className="award-card"
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <motion.div 
        className="award-card__icon"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {award.icon}
      </motion.div>
      <div className="award-card__content">
        <motion.span 
          className="award-card__year"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
        >
          {award.year}
        </motion.span>
        <h4 className="award-card__title">{award.title}</h4>
        <p className="award-card__desc">{award.desc}</p>
      </div>
    </motion.div>
  )
})

const Awards = memo(function Awards() {
  const { language } = useLanguage()
  const data = useMemo(() => AWARDS_DATA[language] || AWARDS_DATA.uz, [language])

  return (
    <section className="awards-section">
      <div className="awards-section__container">
        {/* Header */}
        <motion.div 
          className="awards-section__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="awards-section__badge"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆 {data.title}
          </motion.span>
          <h2 className="awards-section__title">{data.title}</h2>
          <p className="awards-section__subtitle">{data.subtitle}</p>
        </motion.div>

        {/* Stats */}
        <div className="awards-section__stats">
          {data.stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Awards Grid */}
        <div className="awards-section__grid">
          {data.awards.map((award, index) => (
            <AwardCard key={index} award={award} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
})

export default Awards
