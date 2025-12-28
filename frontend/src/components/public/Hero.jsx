import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { siteConfig } from '../../config/siteConfig'
import { 
  FloatingElements, 
  FadeUp, 
  ScaleIn, 
  CountUpNumber, 
  MirrorShadow, 
  DNAFadeIn, 
  RubberBand, 
  FloatingElement,
  AnimatedGradient,
  MeshGradient,
  FloatingBubbles,
  Sparkles,
  PulsingButton
} from '../animations'
import './Hero.css'

const HERO_TEXTS = {
  uz: {
    badge: '2-6 yoshli bolalar uchun',
    brand: 'Play Kids',
    subtitle: 'Zamonaviy Bog\'cha',
    slogan: 'Bolalaringiz baxti - bizning maqsadimiz',
    description: 'Bolalaringiz uchun xavfsiz, qiziqarli va rivojlantiruvchi muhit. Tajribali o\'qituvchilar va zamonaviy ta\'lim metodlari bilan.',
    btn1: 'Ro\'yxatdan o\'tish',
    btn2: 'Batafsil',
    happyChildren: 'Baxtli bolalar',
    experiencedTeachers: 'Tajribali o\'qituvchilar',
    yearsExperience: 'Yillik tajriba'
  },
  ru: {
    badge: 'Для детей 2-6 лет',
    brand: 'Play Kids',
    subtitle: 'Современный детский сад',
    slogan: 'Счастье ваших детей - наша цель',
    description: 'Безопасная, интересная и развивающая среда для ваших детей. С опытными воспитателями и современными методами обучения.',
    btn1: 'Записаться',
    btn2: 'Подробнее',
    happyChildren: 'Счастливых детей',
    experiencedTeachers: 'Опытных воспитателей',
    yearsExperience: 'Лет опыта'
  },
  en: {
    badge: 'For children aged 2-6',
    brand: 'Play Kids',
    subtitle: 'Modern Kindergarten',
    slogan: 'Your children\'s happiness is our goal',
    description: 'A safe, fun and developmental environment for your children. With experienced teachers and modern teaching methods.',
    btn1: 'Enroll Now',
    btn2: 'Learn More',
    happyChildren: 'Happy children',
    experiencedTeachers: 'Experienced teachers',
    yearsExperience: 'Years of experience'
  }
}

const HeroStat = memo(function HeroStat({ value, suffix, label }) {
  return (
    <motion.div 
      className="hero-stat elastic-bounce gradient-border"
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <span className="hero-stat-number neon-glow">
        <CountUpNumber end={value} suffix={suffix} />
      </span>
      <span className="hero-stat-label">{label}</span>
    </motion.div>
  )
})

const Hero = memo(function Hero() {
  const { t, language } = useLanguage()
  const txt = useMemo(() => HERO_TEXTS[language], [language])

  return (
    <section className="hero">
      {/* Animated gradient background */}
      <AnimatedGradient variant="default" speed="slow" className="hero-animated-bg">
        <MeshGradient />
      </AnimatedGradient>
      
      {/* Floating bubbles */}
      <FloatingBubbles count={20} type="mixed" />
      <Sparkles />
      
      <div className="hero-background"><div className="hero-overlay" /></div>
      <FloatingElements />
      
      <div className="hero-content">
        <FadeUp delay={0.1}>
          <RubberBand>
            <motion.div className="hero-badge" transition={{ duration: 2, repeat: Infinity }}>
              {txt.badge}
            </motion.div>
          </RubberBand>
        </FadeUp>
        
        <DNAFadeIn id={1}>
          <h1 className="hero-title">
            <MirrorShadow><span className="hero-brand rainbow-text">{txt.brand}</span></MirrorShadow>
            <span className="hero-subtitle typewriter">{txt.subtitle}</span>
          </h1>
        </DNAFadeIn>
        
        <FadeUp delay={0.3}><p className="hero-slogan">{txt.slogan}</p></FadeUp>
        <FadeUp delay={0.4}><p className="hero-description">{txt.description}</p></FadeUp>
        
        <FadeUp delay={0.5}>
          <div className="hero-cta">
            <Link to="/enrollment" aria-label={txt.btn1} className="hero-cta-link">
              <PulsingButton variant="primary" size="large" pulse glow>
                {txt.btn1}
              </PulsingButton>
            </Link>
            <Link to="/about" aria-label={txt.btn2} className="hero-cta-link">
              <PulsingButton variant="secondary" size="large">
                {txt.btn2}
              </PulsingButton>
            </Link>
          </div>
        </FadeUp>
        
        <ScaleIn delay={0.6}>
          <div className="hero-stats">
            <HeroStat value={siteConfig.stats.happyChildren} suffix="+" label={txt.happyChildren} />
            <HeroStat value={siteConfig.stats.experiencedTeachers} suffix="+" label={txt.experiencedTeachers} />
            <HeroStat value={siteConfig.stats.yearsExperience} suffix="" label={txt.yearsExperience} />
          </div>
        </ScaleIn>
      </div>
    </section>
  )
})

export default Hero
