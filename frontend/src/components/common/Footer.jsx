import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './Footer.css'

const Footer = () => {
  const { language } = useLanguage()
  const currentYear = new Date().getFullYear()

  const texts = {
    uz: {
      pages: "Sahifalar",
      services: "Xizmatlar",
      contactInfo: "Aloqa",
      footerTagline: "Bolalar uchun eng yaxshi ta'lim muhiti",
      rights: "Barcha huquqlar himoyalangan",
      address: "Buxoro viloyati, G'ijduvon tumani",
      home: "Bosh sahifa",
      about: "Biz haqimizda",
      curriculum: "O'quv dasturi",
      contact: "Aloqa",
      teachers: "Xodimlar",
      gallery: "Galereya",
      menu: "Menyu",
      enrollment: "Ro'yxatdan o'tish",
      feedback: "Fikr-mulohaza"
    },
    ru: {
      pages: "Страницы",
      services: "Услуги",
      contactInfo: "Контакты",
      footerTagline: "Лучшая образовательная среда для детей",
      rights: "Все права защищены",
      address: "Бухарская область, Гиждуванский район",
      home: "Главная",
      about: "О нас",
      curriculum: "Программа",
      contact: "Контакты",
      teachers: "Сотрудники",
      gallery: "Галерея",
      menu: "Меню",
      enrollment: "Запись",
      feedback: "Отзывы"
    },
    en: {
      pages: "Pages",
      services: "Services",
      contactInfo: "Contact",
      footerTagline: "The best educational environment for children",
      rights: "All rights reserved",
      address: "Bukhara region, Gijduvan district",
      home: "Home",
      about: "About",
      curriculum: "Curriculum",
      contact: "Contact",
      teachers: "Staff",
      gallery: "Gallery",
      menu: "Menu",
      enrollment: "Enrollment",
      feedback: "Feedback"
    }
  }

  const txt = texts[language] || texts.uz

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <div className="footer-logo swing">
            <img src="/images/logo.png" alt="Play Kids" className="footer-logo-image" />
            <span className="logo-text rainbow-text">Play Kids</span>
          </div>
          <p className="footer-tagline">{txt.footerTagline}</p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">{txt.pages}</h4>
          <ul className="footer-links">
            <li><Link to="/">{txt.home}</Link></li>
            <li><Link to="/about">{txt.about}</Link></li>
            <li><Link to="/curriculum">{txt.curriculum}</Link></li>
            <li><Link to="/contact">{txt.contact}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">{txt.services}</h4>
          <ul className="footer-links">
            <li><Link to="/staff">{txt.teachers}</Link></li>
            <li><Link to="/gallery">{txt.gallery}</Link></li>
            <li><Link to="/menu">{txt.menu}</Link></li>
            <li><Link to="/enrollment">{txt.enrollment}</Link></li>
            <li><Link to="/feedback">{txt.feedback}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">{txt.contactInfo}</h4>
          <ul className="footer-contact">
            <li>📍 {txt.address}</li>
            <li>📞 <a href="tel:+998945140949">+998 94 514 09 49</a></li>
            <li>💬 <a href="https://t.me/play_kids_bot" target="_blank" rel="noopener noreferrer">Telegram Bot</a></li>
            <li>📱 <a href="https://t.me/Boymurodova_Madinabonu" target="_blank" rel="noopener noreferrer">@Boymurodova_Madinabonu</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Play Kids. {txt.rights}.</p>
      </div>
    </footer>
  )
}

export default Footer
