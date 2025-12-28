import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { FadeUp, ScaleIn, HoverCard, ScrollReveal, StaggerContainer, StaggerItem } from '../animations'
import './Benefits.css'

const CARD_COLORS = [
  { bg: 'var(--benefit-pink)', icon: 'var(--benefit-pink-dark)' },
  { bg: 'var(--benefit-blue)', icon: 'var(--benefit-blue-dark)' },
  { bg: 'var(--benefit-green)', icon: 'var(--benefit-green-dark)' },
  { bg: 'var(--benefit-orange)', icon: 'var(--benefit-orange-dark)' },
  { bg: 'var(--benefit-purple)', icon: 'var(--benefit-purple-dark)' },
  { bg: 'var(--benefit-cyan)', icon: 'var(--benefit-cyan-dark)' }
]

const BENEFITS_DATA = {
  uz: {
    title: 'Nima uchun Play Kids?',
    subtitle: 'Bolalaringiz uchun eng yaxshi muhitni yaratish bizning asosiy maqsadimiz',
    items: [
      { icon: '🎨', title: 'Ijodiy rivojlanish', description: 'Bolalar ijodkorligini rivojlantiruvchi turli xil mashg\'ulotlar va loyihalar' },
      { icon: '📚', title: 'Zamonaviy ta\'lim', description: 'Eng so\'nggi pedagogik metodlar asosida tuzilgan o\'quv dasturi' },
      { icon: '🏃', title: 'Jismoniy faollik', description: 'Sport mashg\'ulotlari, o\'yinlar va harakatli faoliyatlar' },
      { icon: '🍎', title: 'Sog\'lom ovqatlanish', description: 'Dietolog tomonidan tuzilgan to\'liq va foydali ovqatlanish menyusi' },
      { icon: '👨‍👩‍👧', title: 'Oilaviy muhit', description: 'Iliq va samimiy muhitda bolalar o\'zlarini uyda his qilishadi' },
      { icon: '🔒', title: 'Xavfsizlik', description: '24/7 kuzatuv va xavfsizlik choralari bilan himoyalangan muhit' }
    ]
  },
  ru: {
    title: 'Почему Play Kids?',
    subtitle: 'Создание лучшей среды для ваших детей - наша главная цель',
    items: [
      { icon: '🎨', title: 'Творческое развитие', description: 'Разнообразные занятия и проекты для развития творчества детей' },
      { icon: '📚', title: 'Современное образование', description: 'Учебная программа на основе новейших педагогических методов' },
      { icon: '🏃', title: 'Физическая активность', description: 'Спортивные занятия, игры и подвижные мероприятия' },
      { icon: '🍎', title: 'Здоровое питание', description: 'Полноценное и полезное меню, составленное диетологом' },
      { icon: '👨‍👩‍👧', title: 'Семейная атмосфера', description: 'В теплой и дружелюбной обстановке дети чувствуют себя как дома' },
      { icon: '🔒', title: 'Безопасность', description: 'Защищенная среда с круглосуточным наблюдением и мерами безопасности' }
    ]
  },
  en: {
    title: 'Why Play Kids?',
    subtitle: 'Creating the best environment for your children is our main goal',
    items: [
      { icon: '🎨', title: 'Creative Development', description: 'Various activities and projects to develop children\'s creativity' },
      { icon: '📚', title: 'Modern Education', description: 'Curriculum based on the latest pedagogical methods' },
      { icon: '🏃', title: 'Physical Activity', description: 'Sports activities, games and active events' },
      { icon: '🍎', title: 'Healthy Eating', description: 'Complete and nutritious menu designed by a dietitian' },
      { icon: '👨‍👩‍👧', title: 'Family Atmosphere', description: 'In a warm and friendly environment, children feel at home' },
      { icon: '🔒', title: 'Safety', description: 'Protected environment with 24/7 monitoring and security measures' }
    ]
  }
}

const BenefitCard = memo(function BenefitCard({ benefit, index, colors }) {
  return (
    <HoverCard hoverEffect="lift">
      <motion.div 
        className={`benefit-card benefit-card-${index + 1}`}
        style={{ '--card-bg': colors.bg, '--card-icon-bg': colors.icon }}
        whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
      >
        <motion.div 
          className="benefit-icon-wrapper" 
          whileHover={{ rotate: 10, scale: 1.1 }}
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: index * 0.2 
          }}
        >
          <span className="benefit-icon">{benefit.icon}</span>
        </motion.div>
        <div className="benefit-content">
          <h3 className="benefit-title">{benefit.title}</h3>
          <p className="benefit-description">{benefit.description}</p>
        </div>
        <div className="benefit-decoration" />
        <div className="benefit-shine" />
      </motion.div>
    </HoverCard>
  )
})

const Benefits = memo(function Benefits() {
  const { language } = useLanguage()
  const data = useMemo(() => BENEFITS_DATA[language], [language])

  return (
    <section className="benefits">
      <div className="benefits-container">
        <div className="benefits-header">
          <ScrollReveal direction="up">
            <h2 className="benefits-title">{data.title}</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="benefits-subtitle">{data.subtitle}</p>
          </ScrollReveal>
        </div>
        <div className="benefits-bento">
          {data.items.map((benefit, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <BenefitCard benefit={benefit} index={index} colors={CARD_COLORS[index]} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
})

export default Benefits
