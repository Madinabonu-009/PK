import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './CurriculumPage.css'

const CurriculumPage = () => {
  const { language } = useLanguage()

  const content = {
    uz: {
      title: "Bolalar uchun",
      subtitle: "O'yin orqali o'rganamiz!",
      explore: "Kashf qilish",
      sections: [
        { 
          path: '/games', 
          icon: '🎮', 
          title: "O'yinlar Markazi", 
          desc: "Xotira o'yini, viktorina, puzzle va boshqalar",
          features: ["🧠 Xotira", "❓ Viktorina", "🧩 Puzzle", "🎨 Rasm"],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        { 
          path: '/library', 
          icon: '📚', 
          title: "Elektron Kutubxona", 
          desc: "Qiziqarli ertaklar va hikoyalar",
          features: ["📖 Ertaklar", "🌍 3 til", "📸 Videolar", "✨ Animatsiya"],
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        }
      ]
    },
    ru: {
      title: "Для детей",
      subtitle: "Учимся играя!",
      explore: "Исследовать",
      sections: [
        { 
          path: '/games', 
          icon: '🎮', 
          title: "Игровой Центр", 
          desc: "Игра на память, викторина, пазлы и другие",
          features: ["🧠 Память", "❓ Викторина", "🧩 Пазлы", "🎨 Рисование"],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        { 
          path: '/library', 
          icon: '📚', 
          title: "Электронная Библиотека", 
          desc: "Интересные сказки и истории",
          features: ["📖 Сказки", "🌍 3 языка", "🐼 Панда", "✨ Анимация"],
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        }
      ]
    },
    en: {
      title: "For Kids",
      subtitle: "Learn through play!",
      explore: "Explore",
      sections: [
        { 
          path: '/games', 
          icon: '🎮', 
          title: "Games Center", 
          desc: "Memory, quiz, puzzles and more",
          features: ["🧠 Memory", "❓ Quiz", "� oPuzzle", "🎨 Drawing"],
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        { 
          path: '/library', 
          icon: '📚', 
          title: "Digital Library", 
          desc: "Interesting stories and tales",
          features: ["📖 Stories", "🌍 3 langs", "🐼 Panda", "✨ Animation"],
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        }
      ]
    }
  }

  const t = content[language] || content.uz

  return (
    <div className="curriculum-page">
      <section className="curriculum-hero">
        <div className="hero-bg">
          <div className="floating-emoji e1 wow-swing">🎨</div>
          <div className="floating-emoji e2 heartbeat">⭐</div>
          <div className="floating-emoji e3 wow-wobble">🎈</div>
          <div className="floating-emoji e4 wow-jello">🌟</div>
        </div>
        <div className="container">
          <div className="hero-icon morph-blob">🎓</div>
          <h1 className="rainbow-text">{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="curriculum-content">
        <div className="container">
          <div className="sections-grid two-cols">
            {t.sections.map((section, index) => (
              <Link 
                to={section.path} 
                key={index} 
                className="section-card parallax-tilt"
              >
                <div className="card-glow holographic" style={{ background: section.gradient }}></div>
                <div className="card-content">
                  <div className="card-icon elastic-bounce" style={{ background: section.gradient }}>
                    {section.icon}
                  </div>
                  <h3>{section.title}</h3>
                  <p>{section.desc}</p>
                  <div className="card-features">
                    {section.features.map((f, i) => (
                      <span key={i} className="feature-tag magnetic-hover">{f}</span>
                    ))}
                  </div>
                  <div className="card-btn liquid-btn neon-glow" style={{ background: section.gradient }}>
                    {t.explore} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CurriculumPage
