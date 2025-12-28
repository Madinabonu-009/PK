import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { FadeUp, ScaleIn } from '../animations'
import './ProblemSolution.css'

const ProblemSolution = () => {
  const { language } = useLanguage()

  const data = {
    uz: {
      title: 'Muammolaringizga yechim',
      subtitle: 'Ko\'plab ota-onalar duch keladigan muammolarga biz yechim topamiz',
      ctaText: 'Farzandingiz uchun eng yaxshi tanlov qiling',
      ctaButton: 'Hoziroq ro\'yxatdan o\'ting',
      problems: [
        { problem: 'Bolam uyda zerikib qoladi', solution: 'Har kuni turli xil qiziqarli mashg\'ulotlar va o\'yinlar' },
        { problem: 'Ijtimoiy ko\'nikmalar yetishmaydi', solution: 'Tengdoshlari bilan muloqot va guruh faoliyatlari' },
        { problem: 'Maktabga tayyorgarlik kerak', solution: 'Bosqichma-bosqich o\'quv dasturi va rivojlantiruvchi mashg\'ulotlar' },
        { problem: 'Ish vaqtida bolaga qaraydigan odam yo\'q', solution: 'Ertalabdan kechgacha professional g\'amxo\'rlik' }
      ]
    },
    ru: {
      title: 'Решение ваших проблем',
      subtitle: 'Мы находим решения для проблем, с которыми сталкиваются многие родители',
      ctaText: 'Сделайте лучший выбор для вашего ребенка',
      ctaButton: 'Записаться сейчас',
      problems: [
        { problem: 'Ребенок скучает дома', solution: 'Ежедневно разнообразные интересные занятия и игры' },
        { problem: 'Не хватает социальных навыков', solution: 'Общение со сверстниками и групповые занятия' },
        { problem: 'Нужна подготовка к школе', solution: 'Поэтапная учебная программа и развивающие занятия' },
        { problem: 'Некому присмотреть за ребенком в рабочее время', solution: 'Профессиональный уход с утра до вечера' }
      ]
    },
    en: {
      title: 'Solutions to Your Problems',
      subtitle: 'We find solutions to problems that many parents face',
      ctaText: 'Make the best choice for your child',
      ctaButton: 'Enroll Now',
      problems: [
        { problem: 'Child gets bored at home', solution: 'Daily variety of interesting activities and games' },
        { problem: 'Lack of social skills', solution: 'Communication with peers and group activities' },
        { problem: 'Need school preparation', solution: 'Step-by-step curriculum and developmental activities' },
        { problem: 'No one to look after the child during work hours', solution: 'Professional care from morning to evening' }
      ]
    }
  }

  const content = data[language]

  return (
    <section className="problem-solution">
      <div className="problem-solution-container">
        <div className="problem-solution-header">
          <FadeUp>
            <h2 className="problem-solution-title">{content.title}</h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="problem-solution-subtitle">{content.subtitle}</p>
          </FadeUp>
        </div>
        
        <div className="problem-solution-grid">
          {content.problems.map((item, index) => (
            <ScaleIn key={index} delay={index * 0.1}>
              <motion.div 
                className="problem-solution-card"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="problem-section">
                  <motion.span 
                    className="problem-icon"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    ❌
                  </motion.span>
                  <p className="problem-text">{item.problem}</p>
                </div>
                <motion.div 
                  className="arrow-divider"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
                <div className="solution-section">
                  <motion.span 
                    className="solution-icon"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    ✅
                  </motion.span>
                  <p className="solution-text">{item.solution}</p>
                </div>
              </motion.div>
            </ScaleIn>
          ))}
        </div>

        <FadeUp delay={0.5}>
          <div className="problem-solution-cta">
            <p className="cta-text">{content.ctaText}</p>
            <Link to="/enrollment" className="cta-button">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {content.ctaButton}
              </motion.span>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

export default ProblemSolution
