import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import './Header.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { language } = useLanguage()

  const texts = {
    uz: {
      home: "Bosh sahifa",
      about: "Biz haqimizda",
      ourChildren: "Bizning bolalar",
      curriculum: "O'quv dasturi",
      contact: "Aloqa",
      enrollment: "Ro'yxatdan o'tish"
    },
    ru: {
      home: "Главная",
      about: "О нас",
      ourChildren: "Наши дети",
      curriculum: "Программа",
      contact: "Контакты",
      enrollment: "Запись"
    },
    en: {
      home: "Home",
      about: "About",
      ourChildren: "Our Children",
      curriculum: "Curriculum",
      contact: "Contact",
      enrollment: "Enroll"
    }
  }

  const txt = texts[language] || texts.uz

  const navLinks = [
    { path: '/', label: txt.home },
    { path: '/about', label: txt.about },
    { path: '/our-children', label: txt.ourChildren },
    { path: '/curriculum', label: txt.curriculum },
    { path: '/contact', label: txt.contact },
  ]

  const toggleMenu = () => setMenuOpen(!menuOpen)

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo wobble" onClick={() => setMenuOpen(false)}>
          <img src="/images/logo.png" alt="Play Kids" className="logo-image" />
          <span className="logo-text rainbow-text">Play Kids</span>
        </Link>

        <button 
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          
          <Link to="/enrollment" className="cta-button liquid-btn neon-glow" onClick={() => setMenuOpen(false)}>
            📝 {txt.enrollment}
          </Link>
          
          <div className="header-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
